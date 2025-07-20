import { Body, ClassSerializerInterceptor, Controller, InternalServerErrorException, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() body: { name: string; email: string; password: string; role?: string }) {
    // Attempt to create user
    const user = await this.usersService.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role ?? 'viewer',
    });

    if (!user) {
      throw new InternalServerErrorException('Could not register user. Please try again.');
    }

    const { access_token } = this.authService.login(user);

    return { access_token, user };
  }

  @Post('login')
  @Public()
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
