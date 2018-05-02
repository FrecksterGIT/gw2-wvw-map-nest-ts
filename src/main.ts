import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import * as express from 'express';
import * as minifyHTML from 'express-minify-html';

import compression = require('compression');
import * as path from 'path';
import {Config} from './app.config';
import {ApplicationModule} from './app.module';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.use(compression());
  setupViewEngine(app);
  setupMinify(app);
  app.disable('x-powered-by');
  await app.startAllMicroservicesAsync();
  await app.listen(PORT);
}

function setupViewEngine(app) {
  app.use('/static', express.static(path.join(__dirname, '../dist/public')));
  app.set('views', Config.viewDirectory);
  app.set('view options', {layout: 'layouts/main'});
  app.set('view engine', 'hbs');
}

function setupMinify(app: INestApplication) {
  if (process.env.NODE_ENV !== 'development') {
    app.use(minifyHTML({
      exception_url: false,
      htmlMinifier: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      override: true
    }));
  }
}

bootstrap();
