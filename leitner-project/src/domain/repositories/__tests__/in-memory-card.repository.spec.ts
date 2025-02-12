import { Category } from 'src/domain/entities/category.enum';
import { InMemoryCardRepository } from '../in-memory-card.repository';
import { Card } from 'src/domain/entities/card.entity';

describe('InMemoryCardRepository', () => {
  let repository: InMemoryCardRepository;

  beforeEach(() => {
    repository = new InMemoryCardRepository();
  });

  describe('save', () => {
    it('should save a card and generate an id', async () => {
      const card = new Card(
        undefined,
        'What is pair programming?',
        'A practice where two developers work on the same computer.',
        'Teamwork',
        Category.FIRST,
      );

      const savedCard = await repository.save(card);

      expect(savedCard.id).toBeDefined();
      expect(typeof savedCard.id).toBe('string');
      expect(savedCard.question).toBe(card.question);
      expect(savedCard.answer).toBe(card.answer);
      expect(savedCard.tag).toBe(card.tag);
      expect(savedCard.category).toBe(card.category);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no cards exist', async () => {
      const cards = await repository.findAllCards();

      expect(cards).toEqual([]);
    });

    it('should return all saved cards', async () => {
      const card1 = new Card(
        undefined,
        'Question 1',
        'Answer 1',
        'Tag1',
        Category.FIRST,
      );
      const card2 = new Card(
        undefined,
        'Question 2',
        'Answer 2',
        'Tag2',
        Category.FIRST,
      );

      await repository.save(card1);
      await repository.save(card2);
      const cards = await repository.findAllCards();

      expect(cards).toHaveLength(2);
      expect(cards).toContain(card1);
      expect(cards).toContain(card2);
    });
  });

  describe('quiz date management', () => {
    it('should return null when no quiz has been taken', async () => {
      const lastQuizDate = await repository.getLastQuizDate();
      expect(lastQuizDate).toBeNull();
    });

    it('should save and retrieve quiz date', async () => {
      const date = new Date();
      await repository.saveQuizDate(date);

      const lastQuizDate = await repository.getLastQuizDate();
      expect(lastQuizDate).toEqual(date);
    });

    it('should correctly identify if quiz was taken on the same day', async () => {
      const today = new Date();
      await repository.saveQuizDate(today);

      const hasQuizBeenTaken = await repository.hasQuizBeenTakenOnDate(today);
      expect(hasQuizBeenTaken).toBe(true);
    });

    it('should correctly identify if quiz was not taken on a different day', async () => {
      const today = new Date();
      await repository.saveQuizDate(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const hasQuizBeenTaken =
        await repository.hasQuizBeenTakenOnDate(tomorrow);
      expect(hasQuizBeenTaken).toBe(false);
    });

    it('should return false when checking quiz taken status with no saved quiz date', async () => {
      const today = new Date();
      const hasQuizBeenTaken = await repository.hasQuizBeenTakenOnDate(today);
      expect(hasQuizBeenTaken).toBe(false);
    });
  });
});