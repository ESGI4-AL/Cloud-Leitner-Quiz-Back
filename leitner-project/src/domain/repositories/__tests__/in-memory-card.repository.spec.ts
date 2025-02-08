import { Category } from "src/domain/entities/category.enum";
import { InMemoryCardRepository } from "../in-memory-card.repository";
import { Card } from "src/domain/entities/card.entity";


describe('InMemoryCardRepository', () => {
  let repository: InMemoryCardRepository;

  beforeEach(() => {
    repository = new InMemoryCardRepository();
  });

  describe('save', () => {
    it('should save a card and generate an id', async () => {
      const card = new Card(
        'What is pair programming?',
        'A practice where two developers work on the same computer.',
        'Teamwork',
        Category.FIRST
      );

      const savedCard = await repository.save(card);

      expect(savedCard.id).toBeDefined();
      expect(typeof savedCard.id).toBe('string');
      expect(savedCard.question).toBe(card.question);
      expect(savedCard.answer).toBe(card.answer);
      expect(savedCard.tag).toBe(card.tag);
      expect(savedCard.category).toBe(card.category);
    });

    describe('findAll', () => {
			it('should return empty array when no cards exist', async () => {
				const cards = await repository.findAll();

				expect(cards).toEqual([]);
			});

			it('should return all saved cards', async () => {
				const card1 = new Card(
					'Question 1',
					'Answer 1',
					'Tag1',
					Category.FIRST
				);
				const card2 = new Card(
					'Question 2',
					'Answer 2',
					'Tag2',
					Category.FIRST
				);

				await repository.save(card1);
				await repository.save(card2);
				const cards = await repository.findAll();

				expect(cards).toHaveLength(2);
				expect(cards).toContain(card1);
				expect(cards).toContain(card2);
			});
		});
	});
});
