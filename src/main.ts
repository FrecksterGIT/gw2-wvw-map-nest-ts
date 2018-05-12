import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import * as express from 'express';
import * as minifyHTML from 'express-minify-html';
import * as path from 'path';
import {Config} from './app.config';
import {ApplicationModule} from './app.module';

import compression = require('compression');
import hbs = require('hbs');
import i18n = require('i18n');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.use(compression());
  setupViewEngine(app);
  setupI18n();
  setupMinify(app);
  app.disable('x-powered-by');
  await app.startAllMicroservicesAsync();
  await app.listen(PORT);
}

function setupViewEngine(app) {

  app.use('/static', express.static(
    path.join(__dirname, (process.env.NODE_ENV === 'development') ? '../dist/public' : './public')));
  app.set('views', Config.viewDirectory);
  app.set('view options', {layout: 'layouts/main'});
  app.set('view engine', 'hbs');
}

function setupI18n() {
  i18n.configure({
    directory: path.join(__dirname, './public/locales'),
    locales: ['en', 'de', 'es', 'fr'],
    updateFiles: false
  });
  hbs.registerHelper('t', (key, locale) => {
    return i18n.__({phrase: key, locale});
  });
}

function setupMinify(app: INestApplication) {
  if (process.env.NODE_ENV !== 'development') {
    app.use(minifyHTML({
      exception_url: false,
      htmlMinifier: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyJS: true,
        processScripts: ['text/x-handlebars-template'],
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      override: true
    }));
  }
}

bootstrap();
