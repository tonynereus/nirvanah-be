import { Controller, Get, Post, Body, ValidationPipe, Put, UseGuards, Req, UseInterceptors, UploadedFile, UseFilters, BadRequestException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

import { diskStorage } from 'multer';
import { MulterExceptionFilter } from 'src/utils/multer-exception.filter';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post("signup")
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post("signin")
  async signin(@Body(ValidationPipe) signinDto: SignInDto) {
    return this.usersService.signinuser(signinDto);
  }



  @UseFilters(MulterExceptionFilter)
  @Put("profile")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(
    FileInterceptor('profile_photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
    })
  )
  async updateProfile(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body(ValidationPipe) updaeUser: UpdateUserDto) {
    const user = req.user;
    const { userId, email } = (user as { userId: number, email: string });

    const profile_photo_url = file
      ? `/uploads/${file.filename}`
      : undefined;

    // return this.userService.updateProfile(userId, updateUserDto, profile_photo_url);
    return this.usersService.updateInfo(userId, updaeUser, profile_photo_url)
  }

  @Get("profile")
  @UseGuards(AuthGuard("jwt"))
  async getProfile(@Req() req: Request) {
    const user = req.user;
    const { userId, email } = (user as { userId: number, email: string });
    return this.usersService.profileInfo(userId);
  }

  @Get("friend-suggestions")
  @UseGuards(AuthGuard("jwt"))
  async friendSuggestions(@Req() req: Request) {
    const user = req.user;
    const { userId, email } = (user as { userId: number, email: string });
    return this.usersService.friendSuggestions(userId);
  }

  @Get("find")
  @UseGuards(AuthGuard("jwt"))
  async search(@Query("q") q: string, @Req() req: Request) {
    const user = req.user;
    const { userId, email } = (user as { userId: number, email: string });
    return this.usersService.search(q, +userId);
  }
}
