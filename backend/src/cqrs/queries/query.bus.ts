import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IQuery, IQueryHandler } from './query.interface';

@Injectable()
export class QueryBus {
  private handlers = new Map<string, IQueryHandler>();

  constructor(private moduleRef: ModuleRef) {}

  registerHandler(queryType: string, handler: Type<IQueryHandler>) {
    const handlerInstance = this.moduleRef.get(handler, { strict: false });
    this.handlers.set(queryType, handlerInstance);
  }

  async execute<T extends IQuery>(query: T): Promise<any> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }

    return handler.execute(query);
  }
}
