import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: configService.getOrThrow("DB_HOST"),
                database: configService.getOrThrow("DB_NAME"),
                username: configService.getOrThrow("DB_USER"),
                password: configService.getOrThrow("DB_PSWD"),
                autoLoadEntities: true,
                synchronize: true
            }),
            inject: [ConfigService]
        })
    ],
})
export class DatabaseModule { }