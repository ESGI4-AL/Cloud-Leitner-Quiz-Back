import { Test, TestingModule } from '@nestjs/testing';
import { CreateCard } from '../create-card.usecase';
import { CardRepository } from 'src/domain/repositories/card.repository';
import { Card } from 'src/domain/entities/card.entity';
import { Category } from 'src/domain/entities/category.enum';

describe('CreateCard', () => {
  let createCard: CreateCard;
  let cardRepository: CardRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCard,
        {
          provide: 'CardRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    createCard = module.get<CreateCard>(CreateCard);
    cardRepository = module.get<CardRepository>('CardRepository');
  });

  it('should be defined', () => {
    expect(createCard).toBeDefined();
  });

  it('should create and save a new card', async () => {
    const question = 'What is pair programming?';
    const answer = 'A practice where two developers work on the same computer.';
    const tag = 'Teamwork';
    const userId = 'default-user-id';

    const expectedCard = new Card(userId, question, answer, tag, Category.FIRST);
    (cardRepository.save as jest.Mock).mockResolvedValue(expectedCard);

    const result = await createCard.execute(userId, question, answer, tag);

    expect(cardRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      question,
      answer,
      tag,
      category: Category.FIRST,
      userId
    }));
    expect(result).toEqual(expectedCard);
  });
});