import { Module } from '@nestjs/common';
import { CardController } from './infrastructure/controllers/card.controller';
import { CreateCard } from './application/use-cases/create-card.usecase';
import { InMemoryCardRepository } from './domain/repositories/in-memory-card.repository';

@Module({
  imports: [],
  controllers: [CardController],
  providers: [
    CreateCard,
    { provide: "CardRepository", useClass: InMemoryCardRepository },
  ],
})
export class AppModule {}
