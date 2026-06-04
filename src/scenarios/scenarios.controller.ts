import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { SubmitScenarioDto } from './dto/submit-scenario.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @UseGuards(JwtAuthGuard)
@Post('submit')
async submitScenario(@Body() dto: SubmitScenarioDto, @Req() req: any) {
  const userId = req.user?.id ?? req.user?.sub ?? 1;

  return this.scenariosService.submitScenario(dto, userId);
}
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyScenarios(@Req() req: any) {
    return this.scenariosService.getMyScenarios(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
@Get('building/:id/what-if-base')
async getWhatIfBase(@Param('id', ParseIntPipe) id: number) {
  return this.scenariosService.getWhatIfBase(id);
}
  
}