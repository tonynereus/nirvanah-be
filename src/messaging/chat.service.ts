// // chat.service.ts
// @Injectable()
// export class ChatService {
//   constructor(@InjectRepository(Message) private messageRepo: Repository<Message>) {}

//    const socket = io('http://localhost:3000/', {
//       auth: { token },
//       withCredentials: true,
//       transports: ['websocket', 'polling'],
//     });

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { chats } from "./entities/chats.entity";
import { EntityManager, Repository } from "typeorm";
import { chatDto } from "./dto/chat.dto";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(chats)
        private readonly chatsRepository: Repository<chats>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly entityManager: EntityManager
    ) { }

    async saveMessage(messageData: chatDto) {
        const receiver = await this.usersRepository.exists({
            where: { id: messageData.receiverId }
        });
        if (!receiver)
            return "User not found";
        const chat = new chats(messageData);
        await this.entityManager.save(chat);
    }

    async getSavedMessages(sender: number, receiver: number) {
        const messages = await this.chatsRepository.find({
            where: [
                {
                    senderId: sender,
                    receiverId: receiver
                },
                {
                    senderId: receiver,
                    receiverId: sender
                }
            ],
            order: { sentAt: "DESC" },
            relations: {
                receiver: true,
                sender: true
            }
        });
        const chats = messages.map(
            cht => {
                const username = cht.sender.username;
                const message = cht.message;
                const senderId = cht.senderId;
                const timestamp = cht.sentAt;
                const id = cht.id;

                return {
                    id,
                    username,
                    message,
                    senderId,
                    timestamp
                }
            }
        )
        return chats;
    }

    async getUsername(receiverId: number) {
        const receiver = await this.usersRepository.findOne({
            where: { id: receiverId }
        });
        if (receiver)
            return receiver.username;
        return "User-" + receiverId;
    }

    async getChatsMessages(sender: number) {
        const messages = await this.chatsRepository.find({
            where: [
                {
                    senderId: sender
                },
                {
                    receiverId: sender
                }
            ],
            order: { sentAt: "DESC" },
            relations: {
                receiver: true,
                sender: true
            }
        });

        const uidAry: string[] = [];
        const conversations = messages.map(
            chat => {
                const isSender: boolean = sender == chat.senderId;
                const chatName = isSender ? chat.receiver.username : chat.sender.username;
                const lastMessage = chat.message;
                const id = isSender ? chat.receiverId : chat.senderId;
                const uid = isSender ? `${chat.senderId}_${chat.receiverId}` : `${chat.receiverId}_${chat.senderId}`;
                if (!uidAry.includes(uid)) {
                    uidAry.push(uid)
                    return {
                        chatName, lastMessage, id, uid, unread: 1, online: true,
                    }
                } else {
                    return undefined
                }

            }
        ).filter(
            chat => chat != undefined
        )
        console.log(uidAry, sender);
        return conversations;
    }

}
