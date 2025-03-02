import { Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';
import { Card } from '../../domain/entities/card.entity';
import { CardRepository } from '../../domain/repositories/card.repository';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../domain/entities/category.enum';

@Injectable()
export class DynamoCardRepository implements CardRepository {
  private readonly dynamoDb: DynamoDB.DocumentClient;
  private readonly tableName: string;
  private readonly quizDateKey = 'QUIZ_DATE';

  constructor() {
    console.log('Initializing DynamoDB in AWS mode');

    this.dynamoDb = new DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'eu-west-1',
      endpoint: `https://dynamodb.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com`
    });

    this.tableName = process.env.CARDS_TABLE_NAME || 'leitner-quiz-api-dev-cards';

    console.log(`DynamoDB initialized with table: ${this.tableName} in region: ${process.env.AWS_REGION || 'eu-west-1'}`);
  }

  async save(card: Card): Promise<Card> {
    console.log(`Saving card to DynamoDB: ${JSON.stringify(card)}`);
    if (!card.id) {
      card.id = uuidv4();
    }

    await this.dynamoDb.put({
      TableName: this.tableName,
      Item: {
        PK: `CARD#${card.id}`,
        SK: `CARD#${card.userId}`,
        id: card.id,
        userId: card.userId,
        question: card.question,
        answer: card.answer,
        tag: card.tag,
        category: card.category,
        createdAt: card.createdAt.toISOString(),
        type: 'CARD'
      }
    }).promise();

    return card;
  }

  async findAllCards(): Promise<Card[]> {
    const result = await this.dynamoDb.scan({
      TableName: this.tableName,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':type': 'CARD'
      }
    }).promise();

    return (result.Items || []).map(item => new Card(
      item.id,
      item.userId,
      item.question,
      item.answer,
      item.tag,
      item.category,
      new Date(item.createdAt)
    ));
  }

  async findById(cardId: string): Promise<Card | null> {
    const result = await this.dynamoDb.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CARD#${cardId}`
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];
    return new Card(
      item.id,
      item.userId,
      item.question,
      item.answer,
      item.tag,
      item.category,
      new Date(item.createdAt)
    );
  }

  async findByTags(tags: string[]): Promise<Card[]> {
    const result = await this.dynamoDb.scan({
      TableName: this.tableName,
      FilterExpression: '#type = :type AND contains(:tags, #tag)',
      ExpressionAttributeNames: {
        '#type': 'type',
        '#tag': 'tag'
      },
      ExpressionAttributeValues: {
        ':type': 'CARD',
        ':tags': tags
      }
    }).promise();

    return (result.Items || []).map(item => new Card(
      item.id,
      item.userId,
      item.question,
      item.answer,
      item.tag,
      item.category,
      new Date(item.createdAt)
    ));
  }

  async findCardsDueForDate(date: Date): Promise<Card[]> {
    const cards = await this.findAllCards();
    const today = new Date(date.setHours(0, 0, 0, 0));

    return cards.filter(card => {
      if (!card.createdAt) return false;

      const frequencies = {
        [Category.FIRST]: 1,
        [Category.SECOND]: 2,
        [Category.THIRD]: 4,
        [Category.FOURTH]: 8,
        [Category.FIFTH]: 16,
        [Category.SIXTH]: 32,
        [Category.SEVENTH]: 64,
      };

      const categoryInterval = frequencies[card.category];
      if (!categoryInterval) return false;

      const daysSinceCreation = Math.floor(
        (today.getTime() - new Date(card.createdAt).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
      );

      return daysSinceCreation % categoryInterval === 0;
    });
  }

  async getLastQuizDate(): Promise<Date | null> {
    const result = await this.dynamoDb.get({
      TableName: this.tableName,
      Key: {
        PK: this.quizDateKey,
        SK: this.quizDateKey
      }
    }).promise();

    return result.Item ? new Date(result.Item.date) : null;
  }

  async saveQuizDate(date: Date): Promise<void> {
    await this.dynamoDb.put({
      TableName: this.tableName,
      Item: {
        PK: this.quizDateKey,
        SK: this.quizDateKey,
        date: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
        type: 'QUIZ_DATE'
      }
    }).promise();
  }

  async hasQuizBeenTakenOnDate(date: Date): Promise<boolean> {
    const lastQuizDate = await this.getLastQuizDate();
    if (!lastQuizDate) return false;

    const lastQuizDay = new Date(lastQuizDate).setHours(0, 0, 0, 0);
    const checkDay = new Date(date).setHours(0, 0, 0, 0);
    return lastQuizDay === checkDay;
  }

  async compareUserAnswer(
    cardId: string,
    userAnswer: string,
    forceValidation: boolean = false
  ): Promise<{ originalAnswer: string; isCorrect: boolean; validated: boolean }> {
    const card = await this.findById(cardId);
    if (!card) {
      throw new Error('The card was not found');
    }

    const normalize = (str: string) => str.trim().toLowerCase();
    const isCorrect = normalize(card.answer) === normalize(userAnswer);

    if (isCorrect) {
      if (card.category === Category.SEVENTH) {
        await this.dynamoDb.delete({
          TableName: this.tableName,
          Key: {
            PK: `CARD#${cardId}`,
            SK: `CARD#${card.userId}`
          }
        }).promise();
      } else {
        const categoryOrder: Category[] = [
          Category.FIRST,
          Category.SECOND,
          Category.THIRD,
          Category.FOURTH,
          Category.FIFTH,
          Category.SIXTH,
          Category.SEVENTH,
        ];
        const currentIndex = categoryOrder.indexOf(card.category);
        if (currentIndex !== -1 && currentIndex < categoryOrder.length - 1) {
          card.category = categoryOrder[currentIndex + 1];
          await this.save(card);
        }
      }
    } else {
      card.category = Category.FIRST;
      await this.save(card);
    }

    return {
      originalAnswer: card.answer,
      isCorrect,
      validated: isCorrect || forceValidation,
    };
  }
}
