import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../models';
import {
  GetReportByIdQuery,
  GetUserReportsQuery,
} from '../queries/report.queries';
import { IQueryHandler } from '../queries/query.interface';

@Injectable()
export class GetReportByIdQueryHandler
  implements IQueryHandler<GetReportByIdQuery>
{
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async execute(query: GetReportByIdQuery): Promise<any> {
    const { payload } = query;
    const { reportId } = payload;

    const report = await this.reportModel.findById(reportId);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return { success: true, report };
  }
}

@Injectable()
export class GetUserReportsQueryHandler
  implements IQueryHandler<GetUserReportsQuery>
{
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async execute(query: GetUserReportsQuery): Promise<any> {
    const { payload } = query;
    const { userId, limit = 10, offset = 0 } = payload;

    const reports = await this.reportModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await this.reportModel.countDocuments({ userId });

    return {
      success: true,
      reports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
}
