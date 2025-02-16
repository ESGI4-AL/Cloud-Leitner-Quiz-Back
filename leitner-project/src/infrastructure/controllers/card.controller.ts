import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Patch,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CreateCard } from 'src/application/use-cases/create-card.usecase';
import { GetCards } from 'src/application/use-cases/get-cards.usecase';
import { GetQuizz } from 'src/application/use-cases/get-quizz.usecase';
import { AnswerCard } from 'src/application/use-cases/answer-card.usecase';
import { Card } from 'src/domain/entities/card.entity';

@Controller('cards')
export class CardController {
  constructor(
    private readonly createCardUseCase: CreateCard,
    private readonly getCardsUseCase: GetCards,
    private readonly getQuizzUseCase: GetQuizz,
    private readonly answerCardUseCase: AnswerCard,
  ) {}

  @Post()
  async createCard(
    @Body() body: { question: string; answer: string; tag: string },
  ) {
    const DEFAULT_USER_ID = 'default-user-id';
    return this.createCardUseCase.execute(
      DEFAULT_USER_ID,
      body.question,
      body.answer,
      body.tag,
    );
  }

  @Get()
  async getCards(@Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.getCardsUseCase.execute(tagArray);
  }

  @Get('quizz')
  async getQuizz(@Query('date') dateStr?: string): Promise<Card[]> {
    let date: Date | undefined;

    if (dateStr) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date');
      }
    }

    try {
      return await this.getQuizzUseCase.execute(date);
    } catch (error) {
      /*if (error.message === 'You can only take one quiz per day') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to get quiz cards');*/
      throw new InternalServerErrorException('Failed to get quiz cards');
    }
  }

  @Patch(':cardId/answer')
  async answerCard(
    @Param('cardId') cardId: string,
    @Body() body: { isValid: boolean },
  ): Promise<void> {
    if (body === undefined || typeof body.isValid !== 'boolean') {
      throw new BadRequestException(
        'Invalid request body: isValid must be a boolean',
      );
    }

    try {
      await this.answerCardUseCase.execute(cardId, body.isValid);
      return;
    } catch (error) {
      if (error.message === 'Card not found') {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to answer the card');
    }
  }
}
