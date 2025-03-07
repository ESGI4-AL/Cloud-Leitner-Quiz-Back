import { Card } from '../entities/card.entity';
import { Category } from '../entities/category.enum';
import { CardRepository } from './card.repository';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryCardRepository implements CardRepository {
  private cards: Card[] = [];
  private lastQuizDate: Date | null = null;

  async save(card: Card): Promise<Card> {
    if (!card.id) {
      card.id = uuidv4();
      this.cards.push(card);
      return card;
    }

    const index = this.cards.findIndex(c => c.id === card.id);
    if (index === -1) {
      throw new Error('Card not found for update');
    }

    this.cards[index] = card;
    return this.cards[index];
  }

  async findAllCards(): Promise<Card[]> {
    return this.cards;
  }

  async findById(cardId: string): Promise<Card | null> {
    const card = this.cards.find((c) => c.id === cardId);
    return card || null;
  }
  async findByTags(tags: string[]): Promise<Card[]> {
    return this.cards.filter((card) => card.tag && tags.includes(card.tag));
  }

  async findCardsDueForDate(date: Date): Promise<Card[]> {
    const today = new Date(date.setHours(0, 0, 0, 0));

    return this.cards.filter((card) => {
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
    return this.lastQuizDate;
  }

  async saveQuizDate(date: Date): Promise<void> {
    this.lastQuizDate = new Date(date.setHours(0, 0, 0, 0));
  }

  async hasQuizBeenTakenOnDate(date: Date): Promise<boolean> {
    if (!this.lastQuizDate) return false;

    const lastQuizDay = new Date(this.lastQuizDate).setHours(0, 0, 0, 0);
    const checkDay = new Date(date).setHours(0, 0, 0, 0);

    return lastQuizDay === checkDay;
  }

  async compareUserAnswer(
    cardId: string,
    userAnswer: string,
    forceValidation: boolean = false
  ): Promise<{ originalAnswer: string; isCorrect: boolean; validated: boolean }> {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('The card was not found');
    }

    const normalize = (str: string) => str.trim().toLowerCase();
    const isCorrect = normalize(card.answer) === normalize(userAnswer);

    if (isCorrect) {
      if (card.category === Category.SEVENTH) {
        this.cards = this.cards.filter((c) => c.id !== card.id);
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
        }
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