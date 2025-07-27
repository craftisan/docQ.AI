// Mock bcrypt.compare before importing the service
jest.mock('bcrypt', () => ({
  __esModule: true,
  compare: jest.fn<Promise<boolean>, [string, string]>(),
}));
import * as bcrypt from 'bcrypt';

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<'findByEmail', jest.Mock>>;
  let jwtService: { sign: jest.Mock };

  const UUID = '550e8400-e29b-41d4-a716-446655440000';
  const email = 'test@example.com';
  const rawPassword = 'plainpass';
  const hashedPassword = 'hashedpass';
  const role = 'user';

  beforeEach(async () => {
    jest.clearAllMocks();
    usersService = { findByEmail: jest.fn() };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: UsersService, useValue: usersService }, { provide: JwtService, useValue: jwtService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('returns the user when email exists and password matches', async () => {
      const user: User = { id: UUID, email, password: hashedPassword, role } as User;
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, rawPassword);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(rawPassword, hashedPassword);
      expect(result).toEqual(user);
    });

    it('returns null when user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      const result = await service.validateUser(email, rawPassword);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      const user: User = { id: UUID, email, password: hashedPassword, role } as User;
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, rawPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(rawPassword, hashedPassword);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns an access_token and the user', () => {
      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);
      const user: User = { id: UUID, email, role } as User;

      const result = service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id, role: user.role });
      expect(result).toEqual({ access_token: token, user });
    });
  });
});
