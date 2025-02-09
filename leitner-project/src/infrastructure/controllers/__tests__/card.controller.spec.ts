import { Test, TestingModule } from '@nestjs/testing';
import { CreateCard } from 'src/application/use-cases/create-card.usecase';
import { GetCards } from 'src/application/use-cases/get-cards.usecase';
import { Card } from 'src/domain/entities/card.entity';
import { Category } from 'src/domain/entities/category.enum';
import { CardController } from '../card.controller';

describe('CardController', () => {
  let controller: CardController;
  let createCardUseCase: CreateCard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CreateCard,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetCards,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
    createCardUseCase = module.get<CreateCard>(CreateCard);
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const DEFAULT_USER_ID = 'default-user-id';
      const body = {
        question: 'What is pair programming?',
        answer: 'A practice where two developers work on the same computer.',
        tag: 'Teamwork'
      };

      const expectedCard = new Card(
        undefined,
        DEFAULT_USER_ID,
        body.question,
        body.answer,
        body.tag,
        Category.FIRST
      );

      (createCardUseCase.execute as jest.Mock).mockResolvedValue(expectedCard);

      const result = await controller.createCard(body);

      expect(createCardUseCase.execute).toHaveBeenCalledWith(
        DEFAULT_USER_ID,
        body.question,
        body.answer,
        body.tag
      );
      expect(result).toBe(expectedCard);
    });

    it('should handle creation errors', async () => {
      const body = {
        question: 'Test Question',
        answer: 'Test Answer',
        tag: 'Test'
      };

      const error = new Error('Failed to create card');
      (createCardUseCase.execute as jest.Mock).mockRejectedValue(error);

      await expect(controller.createCard(body)).rejects.toThrow(error);
    });
  });
});
