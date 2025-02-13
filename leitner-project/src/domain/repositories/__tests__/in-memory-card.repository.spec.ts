import { Category } from 'src/domain/entities/category.enum';
import { InMemoryCardRepository } from '../in-memory-card.repository';
import { Card } from 'src/domain/entities/card.entity';

describe('InMemoryCardRepository', () => {
  let repository: InMemoryCardRepository;

  beforeEach(() => {
    repository = new InMemoryCardRepository();
  });

  describe('compareUserAnswer', () => {
    let card: Card;

    beforeEach(async () => {
      card = new Card(
        undefined,
        'What is TDD?',
        'Test-Driven Development',
        'Testing',
        Category.FIRST,
      );
      await repository.save(card);
    });

    it('should keep the card in category 1 when the answer is incorrect', async () => {
      const result = await repository.compareUserAnswer(card.id, 'Wrong answer');

      expect(result.isCorrect).toBe(false);
    });

    it('should remove the card from the repository if it is in category 7 and answered correctly', async () => {
      card.category = Category.SEVENTH;
      await repository.save(card);

      await repository.compareUserAnswer(card.id, 'Test-Driven Development');

      const allCards = await repository.findAllCards();
      expect(allCards.some(c => c.id === card.id)).toBe(true);
    });
  });

  describe('findCardsDueForDate', () => {
    it('should return only the cards due for the given date based on Leitner frequency', async () => {
      const today = new Date();
      const card1 = new Card(undefined, 'Q1', 'A1', 'Tag1', Category.FIRST);
      const card2 = new Card(undefined, 'Q2', 'A2', 'Tag2', Category.SECOND);
      const card3 = new Card(undefined, 'Q3', 'A3', 'Tag3', Category.THIRD);

      card1.createdAt = new Date(today);
      card2.createdAt = new Date(today);
      card3.createdAt = new Date(today);
      
      await repository.save(card1);
      await repository.save(card2);
      await repository.save(card3);

      const testDate = new Date(today);
      testDate.setDate(testDate.getDate() + 2);

      const dueCards = await repository.findCardsDueForDate(testDate);

      expect(dueCards.some(c => c.id === card1.id)).toBe(true);
      expect(dueCards.some(c => c.id === card2.id)).toBe(true);
      expect(dueCards.some(c => c.id === card3.id)).toBe(true);
    });
  });
});

