export interface IQuery {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IQueryHandler<T extends IQuery = IQuery> {
  execute(query: T): Promise<any>;
}
