import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketAuthMiddleWare } from "./auth.guard";
import { ChatService } from "./chat.service";
import { chatDto } from "./dto/chat.dto";


@WebSocketGateway({
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        credentials: true,
    },
})

// @UseGuards(WsJwtGuard)
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;
    constructor(private readonly jwtService: JwtService
        , private readonly chatService: ChatService
    ) { }

    async afterInit(@ConnectedSocket() socket: Socket) {
        this.server.use(
            SocketAuthMiddleWare(this.jwtService)
        );
    }

    private connectedUsers = new Map<string, string>(); // socketId => userId

    handleConnection(socket: Socket) {

        const user = socket.data.user;
        this.connectedUsers.set(socket.id, user.id);
        console.log(`User ${user.id} connected`);
    }

    handleDisconnect(socket: Socket) {
        const userId = this.connectedUsers.get(socket.id);
        this.connectedUsers.delete(socket.id);
        console.log(`User ${userId} disconnected`);
    }

    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() data: { to: string; message: string },
        @ConnectedSocket() client: Socket
    ) {
        const fromUser = client.data.user;
        const recipientSocket = this.getSocketByUserId(data.to);
        console.log(`User: ${fromUser.id} sent message: ${data.message}`);
        const messageData: chatDto = {
            senderId: fromUser.id,
            receiverId: +data.to,
            message: data.message
        }
        if (recipientSocket) {
            console.log("Target Socket Found");
            const userName = await this.chatService.getUsername(+fromUser.id)
            recipientSocket.emit('receive_message', {
                senderId: fromUser.id,
                message: data.message,
                username: userName,
                timestamp: new Date()
            })
        } else {
            console.log("User not found");
        }
        try {
            await this.chatService.saveMessage(messageData);
            console.log('message saved');
        } catch (err) {
            console.log(err);
        }

    }

    private getSocketByUserId(userId: string): Socket | null {
        for (const [socketId, uid] of this.connectedUsers.entries()) {
            console.log(`SocketId :${socketId} uid :${uid}`);
            if (uid == userId) {
                const socket = this.server.sockets.sockets.get(socketId);
                return socket || null;
            }
        }
        return null;
    }

    // constructor(private readonly chatService: ChatService) { }
}

