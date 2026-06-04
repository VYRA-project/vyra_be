import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        scenarios: {
          orderBy: { createdAt: 'desc' },
          include: {
            element: true,
            impacts: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        total: user.scenarios.length,
        pending: user.scenarios.filter((s) => s.status === 'PENDING').length,
        approved: user.scenarios.filter((s) => s.status === 'APPROVED').length,
        rejected: user.scenarios.filter((s) => s.status === 'REJECTED').length,
      },
      scenarios: user.scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        buildingName: s.element.name,
        simulatedTemp: s.simulatedTemp,
        status: s.status,
        createdAt: s.createdAt,
        impact: s.impacts[0]
          ? {
              dewPoint: s.impacts[0].dewPoint,
              riskLevel: s.impacts[0].riskLevel,
              description: s.impacts[0].description,
            }
          : null,
      })),
    };
  }
}