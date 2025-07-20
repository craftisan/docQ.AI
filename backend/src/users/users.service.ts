import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';
import { UpdateUserRoleDto } from '@/users/dto/update-user-role.dto';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    // Encrypt the user
    const hashed = await bcrypt.hash(dto.password, 10);

    // Create the user
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: dto.role,
    });

    return await this.usersRepo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email }, select: ['id', 'name', 'email', 'password', 'role'] });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id }, select: ['id', 'name', 'email', 'role'] });
  }

  findAll(): Promise<User[]> {
    return this.usersRepo.find({ select: ['id', 'name', 'email', 'role'] });
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    // If user not found, throw error
    if (!user) throw new NotFoundException(`User ${id} not found`);
    // Update user object
    user.role = dto.role;

    return await this.usersRepo.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const { affected } = await this.usersRepo.delete(id);
    if (!affected) throw new NotFoundException(`User ${id} not found`);

    return true;
  }
}
