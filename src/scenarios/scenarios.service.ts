import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SubmitScenarioDto } from './dto/submit-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  async submitScenario(dto: SubmitScenarioDto, userId: number) {
    const currentTemp = await this.prisma.environmentalData.findFirst({
      where: {
        elementId: dto.elementId,
        dataType: 'TEMPERATURE',
      },
      orderBy: {
        measuredAt: 'desc',
      },
    });

    const currentHumidity = await this.prisma.environmentalData.findFirst({
      where: {
        elementId: dto.elementId,
        dataType: 'HUMIDITY',
      },
      orderBy: {
        measuredAt: 'desc',
      },
    });

    if (!currentTemp || !currentHumidity) {
      throw new NotFoundException(
        'Nu există date de temperatură/umiditate pentru această clădire.',
      );
    }

    const dewPoint = this.calculateDewPoint(
      currentTemp.value,
      currentHumidity.value,
    );

    const risk = this.calculateRisk(dto.simulatedTemp, dewPoint);

    const scenario = await this.prisma.scenario.create({
      data: {
        elementId: dto.elementId,
        createdBy: userId,
        name: dto.name,
        simulatedTemp: dto.simulatedTemp,
        status: 'PENDING',
        impacts: {
          create: {
            impactType: 'MOLD_RISK',
            dewPoint,
            riskLevel: risk.riskLevel,
            description: risk.description,
          },
        },
      },
      include: {
        element: true,
        impacts: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        elementId: dto.elementId,
        action: 'SCENARIO_SUBMITTED',
        severity: risk.riskLevel === 'CRITICAL' ? 'WARNING' : 'INFO',
        message: `Scenario "${dto.name}" submitted for ${scenario.element.name}. Risk level: ${risk.riskLevel}.`,
      },
    });

    return {
      scenarioId: scenario.id,
      elementId: scenario.elementId,
      buildingName: scenario.element.name,
      name: scenario.name,
      simulatedTemp: scenario.simulatedTemp,
      status: scenario.status,
      currentTemperature: currentTemp.value,
      currentHumidity: currentHumidity.value,
      dewPoint,
      riskLevel: risk.riskLevel,
      description: risk.description,
    };
  }

  private calculateDewPoint(temperature: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;

    const alpha =
      (a * temperature) / (b + temperature) + Math.log(humidity / 100);

    const dewPoint = (b * alpha) / (a - alpha);

    return Number(dewPoint.toFixed(1));
  }

  private calculateRisk(simulatedTemp: number, dewPoint: number) {
    if (simulatedTemp <= dewPoint + 2) {
      return {
        riskLevel: 'CRITICAL',
        description: `Critical condensation risk. Temperature is too close to dew point ${dewPoint}°C.`,
      };
    }

    if (simulatedTemp <= dewPoint + 5) {
      return {
        riskLevel: 'MODERATE',
        description: `Risk of mold if temp < ${(dewPoint + 5).toFixed(1)}°C.`,
      };
    }

    return {
      riskLevel: 'LOW',
      description: 'No immediate condensation risk detected.',
    };
  }

  async getMyScenarios(userId: number) {
    return this.prisma.scenario.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        element: true,
        impacts: true,
      },
    });
  }
  async getWhatIfBase(elementId: number) {
  const building = await this.prisma.campusElement.findUnique({
    where: { id: elementId },
    select: { id: true, name: true },
  });

  if (!building) {
    throw new NotFoundException('Clădirea nu există.');
  }

  const [currentTemp, currentHumidity] = await Promise.all([
    this.prisma.environmentalData.findFirst({
      where: { elementId, dataType: 'TEMPERATURE' },
      orderBy: { measuredAt: 'desc' },
    }),
    this.prisma.environmentalData.findFirst({
      where: { elementId, dataType: 'HUMIDITY' },
      orderBy: { measuredAt: 'desc' },
    }),
  ]);

  if (!currentTemp || !currentHumidity) {
    throw new NotFoundException(
      'Nu există date de temperatură/umiditate pentru această clădire.',
    );
  }

  const defaultSimulatedTemp = 18;
  const dewPoint = this.calculateDewPoint(
    defaultSimulatedTemp,
    currentHumidity.value,
  );

  const risk = this.calculateRisk(defaultSimulatedTemp, dewPoint);

  return {
    elementId: building.id,
    buildingName: building.name,
    currentTemperature: currentTemp.value,
    currentHumidity: currentHumidity.value,
    defaultSimulatedTemp,
    dewPoint,
    riskLevel: risk.riskLevel,
    description: risk.description,
  };
}
  
  
}
