import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; role?: string }) {
    // Encrypt the password
    const hashed = await bcrypt.hash(body.password, 10);
    // Attempt to create user
    const user = await this.usersService.create({
      email: body.email,
      password: hashed,
      role: body.role || 'viewer',
    });

    if (!user) {
      throw new InternalServerErrorException('Could not register user. Please try again.');
    }

    return user;
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Validate user with email & password
    const user = await this.authService.validateUser(body.email, body.password);
    // If email/password is invalid, throw error
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }
}
