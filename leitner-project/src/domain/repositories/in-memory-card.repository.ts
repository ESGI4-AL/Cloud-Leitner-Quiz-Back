import { Card } from "../entities/card.entity";
import { CardRepository } from "./card.repository";
import { v4 as uuidv4 } from "uuid";

export class InMemoryCardRepository implements CardRepository {
	private cards: Card[] = [];

	async save(card: Card): Promise<Card> {
		card.id = uuidv4();
		this.cards.push(card);
		return card;
	}

	async findAll(): Promise<Card[]> {
		return this.cards;
	}
}
