import { Inject, Injectable } from "@nestjs/common";
import { Card } from "src/domain/entities/card.entity";
import { CardRepository } from "src/domain/repositories/card.repository";

@Injectable()
export class GetCards {
  constructor(@Inject("CardRepository") private readonly cardRepository: CardRepository) {}

  async execute(tags?: string[]): Promise<Card[]> {
    if (tags && tags.length > 0) {
      return this.cardRepository.findByTags(tags);
    }
    return this.cardRepository.findAllCards();
  }
}
