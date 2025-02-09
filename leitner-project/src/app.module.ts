import { Module } from '@nestjs/common';
import { CardController } from './infrastructure/controllers/card.controller';
import { CreateCard } from './application/use-cases/create-card.usecase';
import { InMemoryCardRepository } from './domain/repositories/in-memory-card.repository';
import { InMemoryUserRepository } from './domain/repositories/in-memory-user.repository';

@Module({
  imports: [],
  controllers: [CardController],
  providers: [
    CreateCard,
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
