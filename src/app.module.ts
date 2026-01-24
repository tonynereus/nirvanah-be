import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ChatModule } from './messaging/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),DatabaseModule, UsersModule ,ChatModule,
    ServeStaticModule.forRoot({
      rootPath:join(__dirname,'..','uploads'),
      serveRoot:'/uploads'
    })
  ]
})
export class AppModule {}
