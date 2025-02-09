import { Body, Controller, Post } from "@nestjs/common";
import { CreateCard } from "src/application/use-cases/create-card.usecase";

@Controller('cards')
export class CardController {
	constructor(
    private readonly createCardUseCase: CreateCard,
  ) {}

	@Post()
  async createCard(@Body() body: { question: string; answer: string; tag: string }) {
    const DEFAULT_USER_ID = 'default-user-id';
    return this.createCardUseCase.execute(DEFAULT_USER_ID, body.question, body.answer, body.tag);
  }
}
