import { BadRequestException, UnauthorizedException, ConflictException, Injectable, InternalServerErrorException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import { EntityManager, In, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import { randomInt } from 'crypto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { hobbies } from './entities/hobbies.entity';
import { lookingFor } from './entities/userIntrests.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private entityManager: EntityManager,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

      const otp = randomInt(100000, 999999).toString();
      const otp_exp_time = new Date(Date.now() + 15 * 60 * 1000);

      const user = new User({
        ...createUserDto,
        otp,
        otp_exp_time,
        isVerified: true,
      });

      await this.entityManager.save(user);

      return {
        status: true,
        message: 'Account successfully created',
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        // MySQL: ER_DUP_ENTRY | PostgreSQL: 23505
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Something went wrong please try again later');
    }
  }

  async signinuser(signinDto: SignInDto) {
    const { email, password } = signinDto;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        hobbies: true,
        lookingFor: true
      }
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new HttpException(
        {
          status: false,
          requireVerification: true,
          message: 'Account not verified. Please verify your email.',
          email: user.email,
        },
        HttpStatus.FORBIDDEN, // 403 status code
      );
    }
    const secret = await this.configService.get("JWT_SECRET");
    const serverUrl = await this.configService.get("SERVER_URL");
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { secret });

    return {
      status: true,
      message: 'Sign in successful',
      user: {
        ...user,
        hobbies: user.hobbies.map(x => x.hobby),
        lookingFor: user.lookingFor.map(x => x.intrest),
        otp: undefined,
        otp_exp_time: undefined,
        password: undefined,
        isVerified: undefined,
        profile_photo: (user?.profile_photo && user?.profile_photo != null) ? `${serverUrl}${user?.profile_photo}` : null

      },
      token
    };
  }

  async updateInfo(id: number, updateDto: UpdateUserDto, profile_photo?: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { hobbies: true }
    });

    if (!user)
      throw new BadRequestException('Invalid credentials');

    Object.assign(user, updateDto);

    if (profile_photo) {
      ((user as User).profile_photo as string) = (profile_photo as string)
    }

    if (updateDto.hobbies) {
      const hobbieEntityAry = user.hobbies.map(
        x => new hobbies(x)
      )
      updateDto.hobbies = hobbieEntityAry;
    }

    if (updateDto.lookingFor) {
      const intrestEntityAry = user.lookingFor.map(
        x => new lookingFor(x)
      )
      updateDto.lookingFor = intrestEntityAry;
    }

    const serverUrl = await this.configService.get("SERVER_URL");
    await this.entityManager.save(user);

    return {
      status: true,
      message: "Profile successfully updated",
      user: {
        ...user,
        hobbies: user.hobbies.map(x => x.hobby),
        lookingFor: user.lookingFor.map(x => x.intrest),
        profile_photo: (user?.profile_photo && user?.profile_photo != null) ? `${serverUrl}${user?.profile_photo}` : null,
        otp: undefined,
        otp_exp_time: undefined,
        password: undefined,
        isVerified: undefined

      }
    }

  }

  async profileInfo(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { hobbies: true, lookingFor: true }
    })

    if (!user)
      throw new BadRequestException('Invalid credentials');

    return {
      status: true,
      data: user
    }
  }

  async friendSuggestions(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { hobbies: true, lookingFor: true }
    })

    if (!user)
      throw new BadRequestException('Invalid credentials');

    const lookingForAry = user.lookingFor.map(x => x.intrest);

    const allSuggestions = await this.userRepository.find({
      where:
      {
        lookingFor: {
          intrest: In(lookingForAry)
        },
        isVerified: true,
        id: Not(id)
      }
      ,
      relations: {
        lookingFor: true,
        hobbies: true
      }
    });

    return allSuggestions.map(urs => {
      const { email, username, phone, hobbies, id, lookingFor, location, dateOfBirth, bio } = urs
      return {
        email,
        username,
        phone,
        id,
        hobbies: hobbies.map(x => x.hobby),
        lookingFor: lookingFor.map(x => x.intrest),
        birthday: dateOfBirth,
        bio,
        location
      }
    })
  }

  async search(q: string,id:number) {
    const users = await this.userRepository.find({
      where: { username: Like(`%${q}%`), isVerified: true ,id:Not(id)},
      relations: {
        hobbies: true,
        lookingFor: true
      }
    })

    if (!users)
      throw new NotFoundException('No Result');

    return users.map(urs => {
      const { email, username, phone, hobbies, id, lookingFor, location, dateOfBirth, bio } = urs
      return {
        email,
        username,
        phone,
        id,
        hobbies: hobbies.map(x => x.hobby),
        lookingFor: lookingFor.map(x => x.intrest),
        birthday: dateOfBirth,
        bio,
        location
      }
    })
  }

}
