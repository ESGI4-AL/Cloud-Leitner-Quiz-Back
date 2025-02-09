import { Test, TestingModule } from '@nestjs/testing';
import { GetQuizz } from '../get-quizz.usecase';
import { CardRepository } from 'src/domain/repositories/card.repository';
import { Category } from 'src/domain/entities/category.enum';
import { Card } from 'src/domain/entities/card.entity';


describe('GetQuizz', () => {
  let getQuizz: GetQuizz;
  let cardRepository: jest.Mocked<CardRepository>;

  beforeEach(async () => {
    const mockCardRepository = {
      findCardsDueForDate: jest.fn(),
      getLastQuizDate: jest.fn(),
      saveQuizDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetQuizz,
        {
          provide: 'CardRepository',
          useValue: mockCardRepository,
        },
      ],
    }).compile();

    getQuizz = module.get<GetQuizz>(GetQuizz);
    cardRepository = module.get('CardRepository');
  });

  describe('execute', () => {
    it('should get cards for today when no date is provided', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expectedCards = [
        new Card('1', 'user1', 'Q1', 'A1', 'tag1', Category.FIRST),
        new Card('2', 'user1', 'Q2', 'A2', 'tag2', Category.SECOND),
      ];

      cardRepository.getLastQuizDate.mockResolvedValue(null);
      cardRepository.findCardsDueForDate.mockResolvedValue(expectedCards);

      const result = await getQuizz.execute();

      expect(cardRepository.findCardsDueForDate).toHaveBeenCalledWith(today);
      expect(cardRepository.saveQuizDate).toHaveBeenCalledWith(today);
      expect(result).toEqual(expectedCards);
    });

    it('should get cards for specific date when date is provided', async () => {
      const specificDate = new Date('2024-02-10');
      specificDate.setHours(0, 0, 0, 0);

      const expectedCards = [
        new Card('1', 'user1', 'Q1', 'A1', 'tag1', Category.FIRST),
      ];

      cardRepository.getLastQuizDate.mockResolvedValue(null);
      cardRepository.findCardsDueForDate.mockResolvedValue(expectedCards);

      const result = await getQuizz.execute(specificDate);

      expect(cardRepository.findCardsDueForDate).toHaveBeenCalledWith(specificDate);
      expect(cardRepository.saveQuizDate).toHaveBeenCalledWith(specificDate);
      expect(result).toEqual(expectedCards);
    });

    it('should throw error when quiz is already taken today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      cardRepository.getLastQuizDate.mockResolvedValue(today);

      await expect(getQuizz.execute()).rejects.toThrow('You can only take one quiz per day');
      expect(cardRepository.findCardsDueForDate).not.toHaveBeenCalled();
      expect(cardRepository.saveQuizDate).not.toHaveBeenCalled();
    });

    it('should allow quiz for different date even if quiz is taken today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const expectedCards = [
        new Card('1', 'user1', 'Q1', 'A1', 'tag1', Category.FIRST),
      ];

      cardRepository.getLastQuizDate.mockResolvedValue(today);
      cardRepository.findCardsDueForDate.mockResolvedValue(expectedCards);

      const result = await getQuizz.execute(tomorrow);

      expect(cardRepository.findCardsDueForDate).toHaveBeenCalledWith(tomorrow);
      expect(cardRepository.saveQuizDate).toHaveBeenCalledWith(tomorrow);
      expect(result).toEqual(expectedCards);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      cardRepository.getLastQuizDate.mockRejectedValue(error);

      await expect(getQuizz.execute()).rejects.toThrow('Database error');
    });

    it('should normalize dates to start of day', async () => {
      const dateWithTime = new Date('2024-02-10T15:30:45');
      const normalizedDate = new Date('2024-02-10T00:00:00');

      cardRepository.getLastQuizDate.mockResolvedValue(null);
      cardRepository.findCardsDueForDate.mockResolvedValue([]);

      await getQuizz.execute(dateWithTime);

      expect(cardRepository.findCardsDueForDate).toHaveBeenCalledWith(normalizedDate);
      expect(cardRepository.saveQuizDate).toHaveBeenCalledWith(normalizedDate);
    });
  });
});
