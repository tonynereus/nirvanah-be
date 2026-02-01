import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtService } from '@nestjs/jwt';
import { JwtIoAdapter } from './utils/JwtIoAdapter';
import { ValidationExceptionFilter } from './utils/ValidationPipe';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtService = app.get(JwtService);

  app.use(morgan('combined'));
  app.use((req:any, res:any, next:any) => {
    console.log('=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Origin:', req.headers.origin);
    console.log('Access-Control-Request-Method:', req.headers['access-control-request-method']);
    console.log('Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
    console.log('------------------------');
    next();
  });

  // app.useWebSocketAdapter(new JwtIoAdapter(jwtService));
  app.useGlobalFilters(
    new ValidationExceptionFilter()
  );
  app.enableCors({
    origin: [
      "http://localhost:5173",
      'https://nirvanah-one.vercel.app',
      'https://nirvarnah.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
