import { Injectable } from '@nestjs/common';
import { CardRepository } from 'src/domain/repositories/card.repository';
import { Category } from 'src/domain/entities/category.enum';

@Injectable()
export class AnswerCard {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(cardId: string, isValid: boolean): Promise<void> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    if (isValid) {
      if (card.category === Category.SEVENTH) {
        return;
      }
   
      const categoryOrder: Category[] = [
        Category.FIRST,
        Category.SECOND,
        Category.THIRD,
        Category.FOURTH,
        Category.FIFTH,
        Category.SIXTH,
        Category.SEVENTH,
      ];
      const currentIndex = categoryOrder.indexOf(card.category);
      if (currentIndex !== -1 && currentIndex < categoryOrder.length - 1) {
        card.category = categoryOrder[currentIndex + 1];
      }
    } else {
      card.category = Category.FIRST;
    }

    await this.cardRepository.save(card);
  }
}
