import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepository {

  async findUserById(id: string): Promise<User | null> {
    return new User(id, 'johndoe@example.com');
  }
}
