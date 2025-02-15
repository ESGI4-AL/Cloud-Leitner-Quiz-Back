import { Inject, Injectable } from '@nestjs/common';
import { Card } from 'src/domain/entities/card.entity';
import { Category } from 'src/domain/entities/category.enum';
import { CardRepository } from 'src/domain/repositories/card.repository';

@Injectable()
export class CreateCard {
  constructor(
    @Inject('CardRepository') private readonly cardRepository: CardRepository,
  ) {}

  async execute(
    userId: string,
    question: string,
    answer: string,
    tag: string,
  ): Promise<Card> {
    const newCard = Card.create(userId, question, answer, tag);
    return this.cardRepository.save(newCard);
  }
}
