import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ICommand, ICommandHandler } from './command.interface';

@Injectable()
export class CommandBus {
  private handlers = new Map<string, ICommandHandler>();

  constructor(private moduleRef: ModuleRef) {}

  registerHandler(commandType: string, handler: Type<ICommandHandler>) {
    const handlerInstance = this.moduleRef.get(handler, { strict: false });
    this.handlers.set(commandType, handlerInstance);
  }

  async execute<T extends ICommand>(command: T): Promise<any> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }

    return handler.execute(command);
  }
}
