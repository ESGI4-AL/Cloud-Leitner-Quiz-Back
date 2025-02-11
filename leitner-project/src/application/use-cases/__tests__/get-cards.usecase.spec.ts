import { CardRepository } from 'src/domain/repositories/card.repository';
import { GetCards } from '../get-cards.usecase';
import { Card } from 'src/domain/entities/card.entity';
import { Category } from 'src/domain/entities/category.enum';

describe('GetCards', () => {
  let getCards: GetCards;
  let mockCardRepository: jest.Mocked<CardRepository>;

  const sampleCards: Card[] = [
    new Card('1', 'user1', 'Q1', 'A1', 'javascript', Category.FIRST),
    new Card('2', 'user2', 'Q2', 'A2', 'python', Category.FIRST),
    new Card('3', 'user3', 'Q3', 'A3', 'javascript', Category.FIRST),
  ];

  beforeEach(() => {
    mockCardRepository = {
      findAllCards: jest.fn(),
      findByTags: jest.fn(),
      save: jest.fn(),
      findCardsDueForDate: jest.fn(),
      getLastQuizDate: jest.fn(),
      saveQuizDate: jest.fn(),
      hasQuizBeenTakenOnDate: jest.fn(),
    };

    getCards = new GetCards(mockCardRepository);
  });

  describe('execute', () => {
    it('should return all cards when no tags are provided', async () => {
      mockCardRepository.findAllCards.mockResolvedValue(sampleCards);

      const result = await getCards.execute();

      expect(result).toEqual(sampleCards);
      expect(mockCardRepository.findAllCards).toHaveBeenCalledTimes(1);
      expect(mockCardRepository.findByTags).not.toHaveBeenCalled();
    });

    it('should return all cards when empty tags array is provided', async () => {
      mockCardRepository.findAllCards.mockResolvedValue(sampleCards);

      const result = await getCards.execute([]);

      expect(result).toEqual(sampleCards);
      expect(mockCardRepository.findAllCards).toHaveBeenCalledTimes(1);
      expect(mockCardRepository.findByTags).not.toHaveBeenCalled();
    });

    it('should return filtered cards when tags are provided', async () => {
      const tags = ['javascript'];
      const filteredCards = sampleCards.filter(
        (card) => card.tag === 'javascript',
      );
      mockCardRepository.findByTags.mockResolvedValue(filteredCards);

      const result = await getCards.execute(tags);

      expect(result).toEqual(filteredCards);
      expect(mockCardRepository.findByTags).toHaveBeenCalledWith(tags);
      expect(mockCardRepository.findAllCards).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockCardRepository.findAllCards.mockRejectedValue(error);

      await expect(getCards.execute()).rejects.toThrow('Database error');
    });

    it('should handle repository errors when searching by tags', async () => {
      const error = new Error('Database error');
      mockCardRepository.findByTags.mockRejectedValue(error);

      await expect(getCards.execute(['javascript'])).rejects.toThrow(
        'Database error',
      );
    });
  });
});
