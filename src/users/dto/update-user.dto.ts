// src/users/dto/update-user.dto.ts
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsOptional,
    IsString,
    IsDateString,
    IsPhoneNumber,
    IsNotEmpty,
    ValidateNested,
} from 'class-validator';

export class HobbyDto {
    @IsString()
    hobby: string;
}

export class lookingForDto {
    @IsString()
    intrest: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @IsOptional()
    @IsPhoneNumber('NG') // or your specific locale
    phone?: string;

    @IsOptional()
    @IsString() // or your specific locale
    @IsNotEmpty()
    location?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type((() => HobbyDto))
    hobbies?: HobbyDto[]

    @IsOptional()
    @ValidateNested({ each: true })
    @Type((() => lookingForDto))
    lookingFor?: lookingForDto[]

    // You won't include the profile_photo here directly,
    // it'll be handled via file upload middleware
}
