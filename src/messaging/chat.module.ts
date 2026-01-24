import { Module } from "@nestjs/common";
import { ChatGateWay } from "./chat.gateway";
import { UsersModule } from "src/users/users.module";
import { ChatService } from "./chat.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { chats } from "./entities/chats.entity";
import { ChatControler } from "./chats.controller";
import { User } from "src/users/entities/user.entity";

@Module({
    imports:[UsersModule,TypeOrmModule.forFeature([chats,User])],
    controllers:[ChatControler],
    providers:[ChatGateWay,ChatService]
})
export class ChatModule {}