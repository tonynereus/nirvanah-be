import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtService } from '@nestjs/jwt';
import { JwtIoAdapter } from './utils/JwtIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtService = app.get(JwtService);
  // app.useWebSocketAdapter(new JwtIoAdapter(jwtService));
  app.enableCors({
    origin: [
      "http://localhost:5173",
      'https://nirvanah-one.vercel.app',
      'https://nirvarnah.com' 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
