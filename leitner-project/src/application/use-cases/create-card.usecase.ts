import { Inject, Injectable } from "@nestjs/common";
import { Card } from "src/domain/entities/card.entity";
import { Category } from "src/domain/entities/category.enum";
import { ICardRepository } from "src/domain/repositories/card.repository";

@Injectable()
export class CreateCard {
	constructor(@Inject("ICardRepository") private readonly cardRepository: ICardRepository) {}

	async execute(question: string, answer: string, tag: string): Promise<Card> {
		const newCard = new Card(question, answer, tag, Category.FIRST);
		return this.cardRepository.save(newCard);
	}
}
