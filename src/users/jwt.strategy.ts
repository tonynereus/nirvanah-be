import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || ''
        })
    }

    async validate(payload: any) {
        // Add any extra validation or user fetching if needed
        return { userId: payload.sub, email: payload.email };
    }
}