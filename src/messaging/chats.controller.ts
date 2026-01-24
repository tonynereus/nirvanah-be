import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Controller("chats")
export class ChatControler {
    constructor(
        private readonly chatService: ChatService
    ) { }

    @UseGuards(AuthGuard("jwt"))
    @Get("all")
    async getChats(@Req() req: Request) {
        const user = req.user;
        const { userId, email } = (user as { userId: number, email: string });
        return this.chatService.getChatsMessages(userId);
    }

    @UseGuards(AuthGuard("jwt"))
    @Get(":id")
    async getMessagea(@Param("id") id: number, @Req() req: Request) {
        const user = req.user;
        const { userId, email } = (user as { userId: number, email: string });
        return this.chatService.getSavedMessages(userId, +id);
    }
}