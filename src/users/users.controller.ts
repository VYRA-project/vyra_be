import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub ?? 1;
    return this.usersService.getMyProfile(userId);
  }
}