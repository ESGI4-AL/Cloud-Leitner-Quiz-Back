import { Inject, Injectable } from "@nestjs/common";
import { Card } from "src/domain/entities/card.entity";
import { CardRepository } from "src/domain/repositories/card.repository";

@Injectable()
export class GetQuizz {
  constructor(@Inject("CardRepository") private readonly cardRepository: CardRepository) {}

  async execute(date?: Date): Promise<Card[]> {
    const quizzDate = date || new Date();
    quizzDate.setHours(0, 0, 0, 0);

    const lastQuizDate = await this.cardRepository.getLastQuizDate();
    if (lastQuizDate) {
      const lastQuizDay = new Date(lastQuizDate);
      lastQuizDay.setHours(0, 0, 0, 0);
    }

    await this.cardRepository.saveQuizDate(quizzDate);
    return this.cardRepository.findCardsDueForDate(quizzDate);
  }
}
