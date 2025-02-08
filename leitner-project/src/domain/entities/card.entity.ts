import { Category } from "./category.enum";
import { v4 as uuidv4 } from "uuid";

export class Card {
	constructor(
		public id: string = uuidv4(),
		public question: string,
		public answer: string,
		public tag: string,
		public category: Category = Category.FIRST
	) {}

	resetCategory(): void {
		this.category = Category.FIRST;
	}
}
