import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors';
import { UserRepository } from '../repositories/userRepository';

export class AuthService {
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async register(email: string, password: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    return this.userRepository.create(email, passwordHash);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid credentials');
    }

    return user;
  }
}
