import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.use((req, res, next) => {
    if (
      typeof req.originalUrl === 'string' &&
      req.originalUrl.startsWith('/animals')
    ) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }

    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
