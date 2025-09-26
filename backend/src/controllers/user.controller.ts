import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus } from '../cqrs/commands/command.bus';
import { QueryBus } from '../cqrs/queries/query.bus';
import { JwtAuthGuard } from '../auth';
import { GetUser } from '../auth';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateUserDto,
  SpendCoinsDto,
  EarnCoinsDto,
  SaveProfileResponseDto,
} from './dto/user.dto';
import {
  CreateUserCommand,
  UpdateUserCommand,
  SpendCoinsCommand,
  EarnCoinsCommand,
  UpdateAvatarCommand,
} from '../cqrs/commands/user.commands';
import {
  GetUserByIdQuery,
  GetUserCoinsQuery,
  GetUserProfileQuery,
} from '../cqrs/queries/user.queries';

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const command = new CreateUserCommand(
      `register-${Date.now()}`,
      'CreateUserCommand',
      {
        name: registerUserDto.name,
        email: registerUserDto.email,
        password: registerUserDto.password,
        phone: registerUserDto.phone,
      },
    );

    const userId = await this.commandBus.execute(command);

    return {
      success: true,
      message: 'Usuário registrado com sucesso',
      userId,
    };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    // TODO: Implement login with CQRS
    // For now, keep the existing logic but plan to migrate to CQRS
    return {
      success: false,
      message: 'Login ainda não implementado com CQRS',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('coins')
  async getCoins(@GetUser() user: any) {
    const query = new GetUserCoinsQuery(
      `coins-${Date.now()}`,
      'GetUserCoinsQuery',
      { userId: user.id },
    );

    return this.queryBus.execute(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coins/spend')
  async spendCoins(@GetUser() user: any, @Body() spendCoinsDto: SpendCoinsDto) {
    const command = new SpendCoinsCommand(
      `spend-${Date.now()}`,
      'SpendCoinsCommand',
      {
        userId: user.id,
        amount: spendCoinsDto.amount,
        purpose: 'user_spend',
      },
    );

    return this.commandBus.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coins/earn')
  async earnCoins(@GetUser() user: any, @Body() earnCoinsDto: EarnCoinsDto) {
    const command = new EarnCoinsCommand(
      `earn-${Date.now()}`,
      'EarnCoinsCommand',
      {
        userId: user.id,
        amount: earnCoinsDto.amount,
        source: 'user_earn',
      },
    );

    return this.commandBus.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    const query = new GetUserByIdQuery(
      `user-${Date.now()}`,
      'GetUserByIdQuery',
      { userId },
    );

    return this.queryBus.execute(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const command = new UpdateUserCommand(
      `update-${Date.now()}`,
      'UpdateUserCommand',
      {
        userId,
        updates: updateUserDto,
      },
    );

    await this.commandBus.execute(command);

    return {
      message: 'Usuário atualizado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @GetUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Validação de tamanho máximo (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB em bytes
    if (file.size > maxSize) {
      throw new BadRequestException('O arquivo excede o limite de 2MB');
    }

    const avatarPath = `/uploads/${file.filename}`;

    const command = new UpdateAvatarCommand(
      `avatar-${Date.now()}`,
      'UpdateAvatarCommand',
      {
        userId: user.id,
        avatarPath,
      },
    );

    await this.commandBus.execute(command);

    return {
      message: 'Avatar atualizado com sucesso',
      avatar: avatarPath,
    };
  }

  // TODO: Implement profile response functionality when ProfileResponse model is available
  // @UseGuards(JwtAuthGuard)
  // @Post('profile')
  // async saveProfileResponse(@GetUser() user: any, @Body() saveProfileResponseDto: SaveProfileResponseDto) {
  //   // Implementation pending ProfileResponse model
  // }

  // TODO: Implement profile recommendations when Profile and OpenAI service are available
  // @UseGuards(JwtAuthGuard)
  // @Get('profile/recommendations')
  // async getProfileRecommendations(@GetUser() user: any) {
  //   // Implementation pending Profile model and OpenAI service
  // }
}
