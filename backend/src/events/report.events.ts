export class ReportGeneratedEvent {
  constructor(
    public readonly reportId: string,
    public readonly userId: string,
    public readonly searchQuery: string,
    public readonly reportData: any,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ReportViewedEvent {
  constructor(
    public readonly reportId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ReportSharedEvent {
  constructor(
    public readonly reportId: string,
    public readonly userId: string,
    public readonly sharedWith: string[], // emails or userIds
    public readonly timestamp: Date = new Date(),
  ) {}
}
