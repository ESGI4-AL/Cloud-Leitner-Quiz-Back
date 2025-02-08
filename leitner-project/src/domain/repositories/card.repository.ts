import { Card } from "../entities/card.entity";

export interface CardRepository {
	save(card: Card): Promise<Card>;
}
