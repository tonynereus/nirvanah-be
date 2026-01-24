import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class CreateUserDto {

    @IsEmail()
    email:string

    @IsNotEmpty()
    username:string

    @IsStrongPassword()
    password:string

    
}
