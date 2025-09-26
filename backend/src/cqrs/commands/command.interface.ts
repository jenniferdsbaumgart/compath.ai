export interface ICommand {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ICommandHandler<T extends ICommand = ICommand> {
  execute(command: T): Promise<any>;
}
