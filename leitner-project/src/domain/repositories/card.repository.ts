import { Card } from '../entities/card.entity';

export interface CardRepository {
  save(card: Card): Promise<Card>;
  findAllCards(): Promise<Card[]>;
  findByTags(tags: string[]): Promise<Card[]>;
  findCardsDueForDate(date: Date): Promise<Card[]>;
  getLastQuizDate(): Promise<Date | null>;
  saveQuizDate(date: Date): Promise<void>;
  hasQuizBeenTakenOnDate(date: Date): Promise<boolean>;
}
