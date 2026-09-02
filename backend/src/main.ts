/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

void ConfigModule;
void S3Client;

const expressApp = express();

async function createApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

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

  await app.init();
  return expressApp;
}

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }

  return appPromise;
}

export default async function handler(req, res) {
  const server = await getApp();
  server(req, res);
}

if (!process.env.VERCEL) {
  void getApp().then((server) => {
    server.listen(Number(process.env.PORT ?? 3000));
  });
}
