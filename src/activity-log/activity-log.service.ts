import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

type AlertSeverity = 'WARNING' | 'CRITICAL';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlertsOverview(days = 7) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const alerts = await this.prisma.activityLog.findMany({
      where: {
        severity: {
          in: ['WARNING', 'CRITICAL'],
        },
        createdAt: {
          gte: since,
        },
        elementId: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        element: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const affectedMap = new Map<
      number,
      {
        buildingId: number;
        buildingName: string;
        status: AlertSeverity;
        alertsCount: number;
        latestMessage: string;
        latestSeverity: AlertSeverity;
        latestCreatedAt: Date;
      }
    >();

    for (const alert of alerts) {
      if (alert.elementId === null) {
        continue;
      }

      const buildingId = alert.elementId;
      const severity = alert.severity as AlertSeverity;

      if (!affectedMap.has(buildingId)) {
        affectedMap.set(buildingId, {
          buildingId,
          buildingName: alert.element?.name ?? `Building ${buildingId}`,
          status: severity,
          alertsCount: 1,
          latestMessage: alert.message ?? '',
          latestSeverity: severity,
          latestCreatedAt: alert.createdAt,
        });

        continue;
      }

      const existing = affectedMap.get(buildingId);

      if (!existing) {
        continue;
      }

      existing.alertsCount += 1;

      if (existing.status !== 'CRITICAL' && severity === 'CRITICAL') {
        existing.status = 'CRITICAL';
      }
    }

    return {
      activeAlerts: alerts.length,

      criticalAlerts: alerts.filter(
        (alert) => alert.severity === 'CRITICAL',
      ).length,

      buildingsAffectedCount: affectedMap.size,

      affectedBuildings: Array.from(affectedMap.values()),

      latestAlerts: alerts.slice(0, 10).map((alert) => {
        const buildingId = alert.elementId as number;

        return {
          id: alert.id,
          buildingId,
          buildingName: alert.element?.name ?? `Building ${buildingId}`,
          severity: alert.severity,
          action: alert.action,
          message: alert.message ?? '',
          createdAt: alert.createdAt,
        };
      }),
    };
  }
}