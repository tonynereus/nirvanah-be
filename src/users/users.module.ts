import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { hobbies } from './entities/hobbies.entity';
import { lookingFor } from './entities/userIntrests.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtUserStrategy } from './jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, hobbies, lookingFor]),
    PassportModule,
  JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '3d' },
    }),
    inject: [ConfigService]
  })
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtUserStrategy],
  exports: [PassportModule,JwtModule]
})
export class UsersModule { }
