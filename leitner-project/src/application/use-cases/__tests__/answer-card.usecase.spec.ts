import { AnswerCard } from '../answer-card.usecase';
import { CardRepository } from 'src/domain/repositories/card.repository';
import { Card } from 'src/domain/entities/card.entity';
import { Category } from 'src/domain/entities/category.enum';

describe('AnswerCard Use Case', () => {
  let answerCardUseCase: AnswerCard;
  let cardRepository: jest.Mocked<CardRepository>;

  beforeEach(() => {
    cardRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CardRepository>;

    answerCardUseCase = new AnswerCard(cardRepository);
  });

  it('should move the card to the next category on correct answer', async () => {
    const card = new Card(
      '1',
      'user1',
      'Question?',
      'Answer',
      'Tag',
      Category.FIRST,
    );
    cardRepository.findById.mockResolvedValue(card);

    await answerCardUseCase.execute('1', true);

    expect(card.category).toBe(Category.SECOND);
    expect(cardRepository.save).toHaveBeenCalledWith(card);
  });

  it('should reset the card to Category.FIRST on incorrect answer', async () => {
    const card = new Card(
      '2',
      'user2',
      'Question?',
      'Answer',
      'Tag',
      Category.THIRD,
    );
    cardRepository.findById.mockResolvedValue(card);

    await answerCardUseCase.execute('2', false);

    expect(card.category).toBe(Category.FIRST);
    expect(cardRepository.save).toHaveBeenCalledWith(card);
  });

  it('should do nothing if the card is in Category.SEVENTH and answered correctly', async () => {
    const card = new Card(
      '3',
      'user3',
      'Question?',
      'Answer',
      'Tag',
      Category.SEVENTH,
    );
    cardRepository.findById.mockResolvedValue(card);

    await answerCardUseCase.execute('3', true);

    expect(card.category).toBe(Category.SEVENTH);
    expect(cardRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error if the card is not found', async () => {
    cardRepository.findById.mockResolvedValue(null);

    await expect(answerCardUseCase.execute('4', true)).rejects.toThrow(
      'Card not found',
    );
    expect(cardRepository.save).not.toHaveBeenCalled();
  });
});
