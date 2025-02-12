import { Card } from '../entities/card.entity';
import { Category } from '../entities/category.enum';
import { CardRepository } from './card.repository';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryCardRepository implements CardRepository {
  private cards: Card[] = [];
  private lastQuizDate: Date | null = null;

  async save(card: Card): Promise<Card> {
    card.id = uuidv4();
    this.cards.push(card);
    return card;
  }

  async findAllCards(): Promise<Card[]> {
    return this.cards;
  }

  async findByTags(tags: string[]): Promise<Card[]> {
    return this.cards.filter((card) => card.tag && tags.includes(card.tag));
  }

  async findCardsDueForDate(date: Date): Promise<Card[]> {
    const daysSinceStart = Math.floor(
      (date.getTime() - new Date(0).getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.cards.filter((card) => {
      if (card.category === Category.FIRST) return true;

      const frequencies = {
        [Category.FIRST]: 1,
        [Category.SECOND]: 2,
        [Category.THIRD]: 4,
        [Category.FOURTH]: 8,
        [Category.FIFTH]: 16,
        [Category.SIXTH]: 32,
        [Category.SEVENTH]: 64,
      };

      const frequency = frequencies[card.category];
      return frequency ? daysSinceStart % frequency === 0 : false;
    });
  }

  async getLastQuizDate(): Promise<Date | null> {
    return this.lastQuizDate;
  }

  async saveQuizDate(date: Date): Promise<void> {
    this.lastQuizDate = date;
  }

  async hasQuizBeenTakenOnDate(date: Date): Promise<boolean> {
    if (!this.lastQuizDate) {
      return false;
    }

    const lastQuizDay = new Date(this.lastQuizDate.setHours(0, 0, 0, 0));
    const checkDay = new Date(date.setHours(0, 0, 0, 0));

    return lastQuizDay.getTime() === checkDay.getTime();
  }

  async compareUserAnswer(
    cardId: string,
    userAnswer: string,
    forceValidation: boolean = false,
  ): Promise<{
    originalAnswer: string;
    isCorrect: boolean;
    validated: boolean;
  }> {
    const card = this.cards.find((card) => card.id === cardId);
    if (!card) {
      throw new Error('The card was not found');
    }

    const normalize = (str: string) => str.trim().toLowerCase();
    const isCorrect = normalize(card.answer) === normalize(userAnswer);

    if (isCorrect) {
      const categoryOrder = [
        Category.FIRST,
        Category.SECOND,
        Category.THIRD,
        Category.FOURTH,
        Category.FIFTH,
        Category.SIXTH,
        Category.SEVENTH,
      ];
      const currentIndex = categoryOrder.indexOf(card.category);
      if (currentIndex < categoryOrder.length - 1) {
        card.category = categoryOrder[currentIndex + 1];
      }
    } else {
      card.category = Category.FIRST;
    }

    return {
      originalAnswer: card.answer,
      isCorrect,
      validated: isCorrect || forceValidation,
    };
  }
}

