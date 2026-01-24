import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";

@Injectable()
export class JwtIoAdapter extends IoAdapter {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    create(port: number, options?: any): any {
        console.log("Creating server with JwtIoAdapter on port:", port);
        
        const corsOptions = {
            cors: {
                origin: "http://localhost:5173",
                credentials: true,
            },
        };
        
        const server = super.create(port, { ...options, ...corsOptions });
        console.log("Server created successfully");
        
        server.on('connection', (socket: any) => {
            console.log('🟢 Client connected:', socket.id);
        });
        
        server.use(async (socket: any, next: any) => {
            console.log("🔐 MIDDLEWARE CALLED!");
            next(); // Allow all for testing
        });
        
        return server;
    }
}