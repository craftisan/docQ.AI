// Mock bcrypt before importing the service
jest.mock('bcrypt', () => ({
  hash: jest.fn<Promise<string>, [string, number]>(),
}));
import * as bcrypt from 'bcrypt';

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { Role, UpdateUserRoleDto } from '@/users/dto/update-user-role.dto';
import { createMockRepo, MockRepo } from '../mock-repository';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: MockRepo<User>;

  const UUID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();

    usersRepo = createMockRepo<User>();
    // By default, bcrypt.hash resolves to 'hashedpw'
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: usersRepo }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('creates and saves a new user when email is unique', async () => {
      const dto: CreateUserDto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret',
        role: 'user',
      };

      usersRepo.findOne!.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      usersRepo.create!.mockImplementation((payload) => payload);
      usersRepo.save!.mockResolvedValue({ id: UUID, ...dto, password: 'hashedpw' } as User);

      const result = await service.create(dto);

      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersRepo.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        password: 'hashedpw',
        role: dto.role,
      });
      expect(usersRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ id: UUID, ...dto, password: 'hashedpw' });
    });

    it('throws ConflictException if email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'pw',
        role: 'admin',
      };

      usersRepo.findOne!.mockResolvedValue({ id: UUID, ...dto } as User);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail()', () => {
    it('returns user with selected fields', async () => {
      const user = { id: UUID, name: 'C', email: 'c@d.com', password: 'h', role: 'user' } as User;
      usersRepo.findOne!.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
        select: ['id', 'name', 'email', 'password', 'role'],
      });
      expect(result).toBe(user);
    });
  });

  describe('findById()', () => {
    it('returns user by id with selected fields', async () => {
      const user = { id: UUID, name: 'D', email: 'd@e.com', role: 'admin' } as User;
      usersRepo.findOne!.mockResolvedValue(user);

      const result = await service.findById(UUID);

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { id: UUID },
        select: ['id', 'name', 'email', 'role'],
      });
      expect(result).toBe(user);
    });
  });

  describe('findAll()', () => {
    it('returns array of users with selected fields', async () => {
      const list = [{ id: UUID, name: 'E', email: 'e@f.com', role: 'user' }] as User[];
      usersRepo.find!.mockResolvedValue(list);

      const result = await service.findAll();

      expect(usersRepo.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'role'],
      });
      expect(result).toBe(list);
    });
  });

  describe('updateRole()', () => {
    it('updates and returns user role when found', async () => {
      const existing = { id: UUID, name: 'F', email: 'f@g.com', role: 'user' } as User;
      usersRepo.findOne!.mockResolvedValue(existing);
      usersRepo.save!.mockResolvedValue({ ...existing, role: 'admin' });

      const dto: UpdateUserRoleDto = { role: 'admin' as Role };
      const result = await service.updateRole(UUID, dto);

      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { id: UUID } });
      expect(usersRepo.save).toHaveBeenCalledWith({ ...existing, role: dto.role });
      expect(result.role).toBe('admin');
    });

    it('throws NotFoundException when user not found', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      const dto: UpdateUserRoleDto = { role: 'admin' as Role };

      await expect(service.updateRole(UUID, dto)).rejects.toThrow(NotFoundException);
      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { id: UUID } });
      expect(usersRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('returns true when deletion is successful', async () => {
      usersRepo.delete!.mockResolvedValue({ affected: 1 });
      const result = await service.remove(UUID);

      expect(usersRepo.delete).toHaveBeenCalledWith(UUID);
      expect(result).toBe(true);
    });

    it('throws NotFoundException when no records deleted', async () => {
      usersRepo.delete!.mockResolvedValue({ affected: 0 });

      await expect(service.remove(UUID)).rejects.toThrow(NotFoundException);
      expect(usersRepo.delete).toHaveBeenCalledWith(UUID);
    });
  });
});
