import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') 
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
 @Post('login')
  async login(@Body() dto: LoginDto) {
   console.log('--- LOGIN REQUEST RECEIVED ---');
  console.log('Data received from Unity:', dto);
    
    try {
      const result = await this.authService.login(dto);
      console.log('Login successful for:', dto.email);
      return result;
    } catch (error) {
 console.error('LOGIN ERROR:', error.message);
      throw error; 
    }
  }

}