import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<'login' | 'validateUser', jest.Mock>>;
  let usersService: Partial<Record<'create', jest.Mock>>;

  const UUID = '550e8400-e29b-41d4-a716-446655440000';
  const email = 'test@example.com';
  const password = 'pass';

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      validateUser: jest.fn(),
    };
    usersService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    const body = { name: 'Alice', email, password };

    it('registers a user with default role and returns token and user', async () => {
      const user = { id: UUID, name: 'Alice', email, role: 'viewer' } as User;
      const token = 'jwt-token';

      usersService.create!.mockResolvedValue(user);
      authService.login!.mockReturnValue({ access_token: token, user });

      const result = await controller.register(body);

      expect(usersService.create).toHaveBeenCalledWith({
        name: body.name,
        email: body.email,
        password: body.password,
        role: 'viewer',
      });
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: token, user });
    });

    it('registers a user with provided role', async () => {
      const bodyWithRole = { ...body, role: 'admin' };
      const user = { id: UUID, name: 'Alice', email, role: 'admin' } as User;
      const token = 'token2';

      usersService.create!.mockResolvedValue(user);
      authService.login!.mockReturnValue({ access_token: token, user });

      const result = await controller.register(bodyWithRole);
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'Alice',
        email,
        password,
        role: 'admin',
      });
      expect(result).toEqual({ access_token: token, user });
    });

    it('throws InternalServerErrorException when user creation fails', async () => {
      usersService.create!.mockResolvedValue(null);
      await expect(controller.register(body)).rejects.toThrow(InternalServerErrorException);
      expect(usersService.create).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const creds = { email, password };

    it('returns error on invalid credentials', async () => {
      authService.validateUser!.mockResolvedValue(null);

      const result = await controller.login(creds);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('returns token and user on valid credentials', async () => {
      const user = { id: UUID, email, role: 'user' } as User;
      const token = 'jwt';

      authService.validateUser!.mockResolvedValue(user);
      authService.login!.mockReturnValue({ access_token: token, user });

      const result = await controller.login(creds);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: token, user });
    });
  });
});
