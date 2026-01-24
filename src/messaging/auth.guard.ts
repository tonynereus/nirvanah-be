import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

type SocketMiddleWare = (socket: Socket, next: (err?: Error) => void) => void
type JwtTokenPayload = {
    sub: number;
    email: string;
}

export const SocketAuthMiddleWare = (
    jwtService: JwtService
): SocketMiddleWare => {
    return async (socket: Socket, next) => {
        try {
            const token = socket.handshake?.auth?.token;

            if (!token) {
                throw new Error('Authorization token is missing');
            }

            let payload: JwtTokenPayload | null = null;

            try {
                payload = await jwtService.verifyAsync<JwtTokenPayload>(token);
            } catch (error) {
                console.log("Auth Error");
                throw new Error('Authorization token is invalid');
            }

            console.log(payload);

            socket.data.user = {
                id:payload.sub,
                email:payload.email
            }

            // socket = Object.assign(socket, {
            //     userInfo: payload
            // });
            next();
        } catch (error) {
            next(new Error('Unauthorized'));
        }
    };

}
