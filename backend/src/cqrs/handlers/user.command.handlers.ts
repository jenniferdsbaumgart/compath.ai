import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../models';
import {
  CreateUserCommand,
  UpdateUserCommand,
  SpendCoinsCommand,
  EarnCoinsCommand,
  UpdateAvatarCommand,
} from '../commands/user.commands';
import { ICommandHandler } from '../commands/command.interface';
import { UserRegisteredEvent, UserProfileUpdatedEvent, UserCoinsSpentEvent, UserCoinsEarnedEvent } from '../../events';

@Injectable()
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { payload } = command;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: payload.email });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const user = new this.userModel({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      coins: 50,
      profileCompletion: 0,
      invitedFriends: [],
      favourites: [],
    });

    const savedUser = await user.save();

    // Emit event
    const event = new UserRegisteredEvent(
      (savedUser._id as any).toString(),
      payload.email,
      payload.name,
    );

    // TODO: Publish event to message broker

    return (savedUser._id as any).toString();
  }
}

@Injectable()
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { payload } = command;
    const { userId, updates } = payload;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('Usuário não encontrado');
    }

    // Apply updates
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.location !== undefined) user.location = updates.location;
    if (updates.company !== undefined) user.company = updates.company;
    if (updates.website !== undefined) user.website = updates.website;
    if (updates.bio !== undefined) user.bio = updates.bio;

    await user.save();

    // Emit event
    const event = new UserProfileUpdatedEvent(
      userId,
      updates,
    );

    // TODO: Publish event to message broker
  }
}

@Injectable()
export class SpendCoinsCommandHandler implements ICommandHandler<SpendCoinsCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: SpendCoinsCommand): Promise<{ remainingCoins: number }> {
    const { payload } = command;
    const { userId, amount, purpose } = payload;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('Usuário não encontrado');
    }

    if (user.coins < amount) {
      throw new ConflictException('Moedas insuficientes');
    }

    user.coins -= amount;
    await user.save();

    // Emit event
    const event = new UserCoinsSpentEvent(
      userId,
      amount,
      purpose,
      user.coins,
    );

    // TODO: Publish event to message broker

    return { remainingCoins: user.coins };
  }
}

@Injectable()
export class EarnCoinsCommandHandler implements ICommandHandler<EarnCoinsCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: EarnCoinsCommand): Promise<{ totalCoins: number }> {
    const { payload } = command;
    const { userId, amount, source } = payload;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('Usuário não encontrado');
    }

    user.coins += amount;
    await user.save();

    // Emit event
    const event = new UserCoinsEarnedEvent(
      userId,
      amount,
      source,
      user.coins,
    );

    // TODO: Publish event to message broker

    return { totalCoins: user.coins };
  }
}

@Injectable()
export class UpdateAvatarCommandHandler implements ICommandHandler<UpdateAvatarCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: UpdateAvatarCommand): Promise<void> {
    const { payload } = command;
    const { userId, avatarPath } = payload;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true },
    );

    if (!user) {
      throw new ConflictException('Usuário não encontrado');
    }

    // Emit event if needed
    // TODO: Publish event to message broker
  }
}
