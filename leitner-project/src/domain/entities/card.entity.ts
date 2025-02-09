import { Category } from "./category.enum";
import { v4 as uuidv4 } from "uuid";

export class Card {
	constructor(
		public id: string = uuidv4(),
		public userId: string  = 'default-user-id',
		public question: string,
		public answer: string,
		public tag: string,
		public category: Category = Category.FIRST,
		public createdAt: Date = new Date()
	) {}

	static create(userId: string, question: string, answer: string, tag: string): Card {
    return new Card(undefined, userId, question, answer, tag);
  }

	resetCategory(): void {
		this.category = Category.FIRST;
	}
}
