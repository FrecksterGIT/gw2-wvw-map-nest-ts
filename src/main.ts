import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import * as express from 'express';
import * as path from 'path';
import {Config} from './app.config';
import {ApplicationModule} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  setupViewEngine(app);
  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}

function setupViewEngine(app: INestApplication) {
  app.use('/static', express.static(path.join(__dirname, '../dist/public')));
  app.set('views', Config.viewDirectory);
  app.set('view options', {layout: 'layouts/main'});
  app.set('view engine', 'hbs');
}

bootstrap();
