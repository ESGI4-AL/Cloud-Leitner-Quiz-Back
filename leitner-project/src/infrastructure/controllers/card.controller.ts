import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateCard } from "src/application/use-cases/create-card.usecase";
import { GetCards } from "src/application/use-cases/get-cards.usecase";

@Controller('cards')
export class CardController {
	constructor(
    private readonly createCardUseCase: CreateCard,
    private readonly getCardsUseCase: GetCards,
  ) {}

	@Post()
  async createCard(@Body() body: { question: string; answer: string; tag: string }) {
    const DEFAULT_USER_ID = 'default-user-id';
    return this.createCardUseCase.execute(DEFAULT_USER_ID, body.question, body.answer, body.tag);
  }

  @Get()
  async getCards(@Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.getCardsUseCase.execute(tagArray);
  }

}
