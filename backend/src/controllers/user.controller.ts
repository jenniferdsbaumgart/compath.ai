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
import { UserService } from '../services/user.service';
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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('coins')
  async getCoins(@GetUser() user: any) {
    return this.userService.getUserCoins(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coins/spend')
  async spendCoins(@GetUser() user: any, @Body() spendCoinsDto: SpendCoinsDto) {
    return this.userService.spendCoins(user.id, spendCoinsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coins/earn')
  async earnCoins(@GetUser() user: any, @Body() earnCoinsDto: EarnCoinsDto) {
    return this.userService.earnCoins(user.id, earnCoinsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
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
    return this.userService.updateAvatar(user.id, avatarPath);
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
