import { Module } from '@nestjs/common';
import { CardController } from './infrastructure/controllers/card.controller';
import { CreateCard } from './application/use-cases/create-card.usecase';
import { InMemoryCardRepository } from './domain/repositories/in-memory-card.repository';
import { GetQuizz } from './application/use-cases/get-quizz.usecase';
import { InMemoryUserRepository } from './domain/repositories/in-memory-user.repository';
import { GetCards } from './application/use-cases/get-cards.usecase';

@Module({
  imports: [],
  controllers: [CardController],
  providers: [
    CreateCard,
    GetCards,
    GetQuizz,
    { provide: "CardRepository",
      useClass: InMemoryCardRepository
    },
    {
      provide: 'UserRepository',
      useClass: InMemoryUserRepository,
    },
  ],
})
export class AppModule {}
