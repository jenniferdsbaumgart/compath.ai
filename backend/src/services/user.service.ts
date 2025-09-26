import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../models';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateUserDto,
  SpendCoinsDto,
  EarnCoinsDto,
} from '../controllers/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, phone } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      coins: 50,
      profileCompletion: 0,
      invitedFriends: [],
      favourites: [],
    });

    await user.save();

    const token = this.jwtService.sign(
      { sub: (user._id as any).toString(), email: user.email },
      { expiresIn: '7d' },
    );

    const userResponse = {
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
      profileCompletion: user.profileCompletion,
      invitedFriends: user.invitedFriends,
      favourites: user.favourites,
    };

    return {
      success: true,
      token,
      user: userResponse,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwtService.sign(
      { sub: (user._id as any).toString(), email: user.email },
      { expiresIn: '7d' },
    );

    const userResponse = {
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
    };

    return {
      success: true,
      token,
      user: userResponse,
    };
  }

  async getUserCoins(userId: string) {
    const user = await this.userModel.findById(userId).select('coins');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { coins: user.coins };
  }

  async spendCoins(userId: string, spendCoinsDto: SpendCoinsDto) {
    const { amount } = spendCoinsDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.coins < amount) {
      throw new ConflictException('Moedas insuficientes');
    }

    user.coins -= amount;
    await user.save();

    return {
      success: true,
      coins: user.coins,
    };
  }

  async earnCoins(userId: string, earnCoinsDto: EarnCoinsDto) {
    const { amount } = earnCoinsDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.coins += amount;
    await user.save();

    return { coins: user.coins };
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { user };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { name, email, phone, location, company, website, bio } =
      updateUserDto;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (company) user.company = company;
    if (website) user.website = website;
    if (bio) user.bio = bio;

    await user.save();

    const userResponse = {
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
      profileCompletion: user.profileCompletion,
      invitedFriends: user.invitedFriends,
      favourites: user.favourites,
    };

    return {
      user: userResponse,
      message: 'Usuário atualizado com sucesso',
    };
  }

  async updateAvatar(userId: string, avatarPath: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      message: 'Avatar atualizado com sucesso',
      avatar: user.avatar,
    };
  }
}
