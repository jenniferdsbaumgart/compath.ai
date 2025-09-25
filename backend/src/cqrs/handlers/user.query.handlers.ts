import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../models';
import {
  GetUserByIdQuery,
  GetUserCoinsQuery,
  GetUserProfileQuery,
} from '../queries/user.queries';
import { IQueryHandler } from '../queries/query.interface';

@Injectable()
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<any> {
    const { payload } = query;
    const { userId } = payload;

    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { user };
  }
}

@Injectable()
export class GetUserCoinsQueryHandler implements IQueryHandler<GetUserCoinsQuery> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(query: GetUserCoinsQuery): Promise<{ coins: number }> {
    const { payload } = query;
    const { userId } = payload;

    const user = await this.userModel.findById(userId).select('coins');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { coins: user.coins };
  }
}

@Injectable()
export class GetUserProfileQueryHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<any> {
    const { payload } = query;
    const { userId } = payload;

    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        coins: user.coins,
        createdAt: user.createdAt,
        phone: user.phone,
        location: user.location,
        company: user.company,
        website: user.website,
        bio: user.bio,
        avatar: user.avatar,
        profileCompletion: user.profileCompletion || 0,
        invitedFriends: user.invitedFriends || [],
        favourites: user.favourites || [],
      },
    };
  }
}
