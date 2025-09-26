import { ICommand } from './command.interface';

export class GenerateAiReportCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GenerateAiReportCommand',
    public readonly payload: {
      userId: string;
      userInput: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class SaveReportCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'SaveReportCommand',
    public readonly payload: {
      userId: string;
      searchQuery: string;
      report: any;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
