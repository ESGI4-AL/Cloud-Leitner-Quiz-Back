import { User } from "../entities/user.entity";

export interface UserRepository {
  findUserById(id: string): Promise<User | null>;
}
