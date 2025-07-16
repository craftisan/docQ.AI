import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';
import { UpdateUserRoleDto } from '@/users/dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  create(user: Partial<User>) {
    return this.usersRepo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id }, select: ['id', 'email', 'role'] });
  }

  findAll(): Promise<Partial<User>[]> {
    return this.usersRepo.find({ select: ['id', 'email', 'role'] });
  }

  async updateRole(id: number, dto: UpdateUserRoleDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    // If user not found, throw error
    if (!user) throw new NotFoundException(`User ${id} not found`);
    // Update user object
    user.role = dto.role;
    const updatedUser = await this.usersRepo.save(user);
    return { id: user.id, email: user.email, role: updatedUser.role };
  }

  async remove(id: number): Promise<void> {
    const { affected } = await this.usersRepo.delete(id);
    if (!affected) throw new NotFoundException(`User ${id} not found`);
  }
}
