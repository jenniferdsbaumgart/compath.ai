import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models';

// Command handlers
import {
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  SpendCoinsCommandHandler,
  EarnCoinsCommandHandler,
  UpdateAvatarCommandHandler,
} from './handlers/user.command.handlers';

// Query handlers
import {
  GetUserByIdQueryHandler,
  GetUserCoinsQueryHandler,
  GetUserProfileQueryHandler,
} from './handlers/user.query.handlers';

// Buses
import { CommandBus } from './commands/command.bus';
import { QueryBus } from './queries/query.bus';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    // Command handlers
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    SpendCoinsCommandHandler,
    EarnCoinsCommandHandler,
    UpdateAvatarCommandHandler,

    // Query handlers
    GetUserByIdQueryHandler,
    GetUserCoinsQueryHandler,
    GetUserProfileQueryHandler,

    // Buses
    CommandBus,
    QueryBus,
  ],
  exports: [CommandBus, QueryBus],
})
export class CqrsModule implements OnModuleInit {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,

    // Command handlers
    private createUserHandler: CreateUserCommandHandler,
    private updateUserHandler: UpdateUserCommandHandler,
    private spendCoinsHandler: SpendCoinsCommandHandler,
    private earnCoinsHandler: EarnCoinsCommandHandler,
    private updateAvatarHandler: UpdateAvatarCommandHandler,

    // Query handlers
    private getUserByIdHandler: GetUserByIdQueryHandler,
    private getUserCoinsHandler: GetUserCoinsQueryHandler,
    private getUserProfileHandler: GetUserProfileQueryHandler,
  ) {}

  onModuleInit() {
    // Register command handlers
    this.commandBus.registerHandler('CreateUserCommand', CreateUserCommandHandler);
    this.commandBus.registerHandler('UpdateUserCommand', UpdateUserCommandHandler);
    this.commandBus.registerHandler('SpendCoinsCommand', SpendCoinsCommandHandler);
    this.commandBus.registerHandler('EarnCoinsCommand', EarnCoinsCommandHandler);
    this.commandBus.registerHandler('UpdateAvatarCommand', UpdateAvatarCommandHandler);

    // Register query handlers
    this.queryBus.registerHandler('GetUserByIdQuery', GetUserByIdQueryHandler);
    this.queryBus.registerHandler('GetUserCoinsQuery', GetUserCoinsQueryHandler);
    this.queryBus.registerHandler('GetUserProfileQuery', GetUserProfileQueryHandler);
  }
}
