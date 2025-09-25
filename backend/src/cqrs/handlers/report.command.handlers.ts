import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../models';
import { AiReportService } from '../../services/ai-report.service';
import { UserService } from '../../services/user.service';
import {
  GenerateAiReportCommand,
  SaveReportCommand,
} from '../commands/report.commands';
import { ICommandHandler } from '../commands/command.interface';
import { ReportGeneratedEvent } from '../../events';

@Injectable()
export class GenerateAiReportCommandHandler implements ICommandHandler<GenerateAiReportCommand> {
  constructor(
    private aiReportService: AiReportService,
    private userService: UserService,
  ) {}

  async execute(command: GenerateAiReportCommand): Promise<any> {
    const { payload } = command;
    const { userId, userInput } = payload;

    // Check user authentication (would be done by guard in controller)
    // Check if user has enough coins (cost: 10 coins per report)
    const userCoins = await this.userService.getUserCoins(userId);
    const reportCost = 10;

    if (userCoins.coins < reportCost) {
      throw new ConflictException({
        success: false,
        error: 'Moedas insuficientes. Você precisa de 10 moedas para gerar um relatório.',
        requiredCoins: reportCost,
        userCoins: userCoins.coins,
      });
    }

    // Generate the report
    const report = await this.aiReportService.generateMarketReport(userInput);

    // Deduct coins after successful generation
    await this.userService.spendCoins(userId, {
      amount: reportCost,
    });

    // Emit event
    const event = new ReportGeneratedEvent(
      `report-${Date.now()}`, // This would be the actual report ID after saving
      userId,
      userInput,
      report,
    );

    // TODO: Publish event to message broker

    return {
      success: true,
      report,
      coinsSpent: reportCost,
      remainingCoins: userCoins.coins - reportCost,
    };
  }
}

@Injectable()
export class SaveReportCommandHandler implements ICommandHandler<SaveReportCommand> {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async execute(command: SaveReportCommand): Promise<{ reportId: string }> {
    const { payload } = command;
    const { userId, searchQuery, report } = payload;

    // Normalize the report data
    const normalized = this.normalizeIncomingReport(report);

    const saved = await this.reportModel.create({
      userId,
      searchQuery,
      report: normalized,
    });

    return { reportId: (saved._id as any).toString() };
  }

  private normalizeIncomingReport(raw: any) {
    const r = { ...(raw || {}) };

    // title (opcional)
    if (raw?.title) r.title = String(raw.title).trim();

    // targetAudience: string -> array (o front prefere array)
    if (typeof r.targetAudience === 'string') {
      r.targetAudience = r.targetAudience
        .split(/,| e /i)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 10);
    }
    if (!Array.isArray(r.targetAudience)) r.targetAudience = [];

    // customerSegments: normaliza shape, mas pode ser removido no save (schema não tem)
    if (Array.isArray(r.customerSegments)) {
      r.customerSegments = r.customerSegments
        .map((s: any) => ({
          name: String(s?.name ?? '').trim(),
          percentage: Number(s?.percentage ?? s?.value ?? 0),
        }))
        .filter((s: any) => s.name && Number.isFinite(s.percentage));
    } else {
      r.customerSegments = [];
    }

    // listas garantidas
    const listKeys = [
      'keyPlayers',
      'opportunities',
      'challenges',
      'recommendations',
      'strengths',
      'weaknesses',
    ];
    for (const k of listKeys) if (!Array.isArray(r[k])) r[k] = [];

    // keyPlayers: só os campos que o schema conhece
    r.keyPlayers = (Array.isArray(r.keyPlayers) ? r.keyPlayers : [])
      .map((kp: any) => ({
        name: String(kp?.name ?? '').trim(),
        marketShare:
          kp?.marketShare != null ? String(kp.marketShare).trim() : undefined,
        visibilityIndex: Number.isFinite(Number(kp?.visibilityIndex))
          ? Number(kp.visibilityIndex)
          : undefined,
      }))
      .filter((kp: any) => kp.name);

    // fontes e dataQuality (schema aceita "verified" | "no_evidence")
    if (!Array.isArray(r.sources)) r.sources = [];
    if (r.dataQuality !== 'verified') r.dataQuality = 'no_evidence';

    return r;
  }
}
