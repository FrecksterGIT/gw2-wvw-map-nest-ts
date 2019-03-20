import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {ExpressAdapter} from "@nestjs/platform-express";

import * as express from 'express';
import * as minifyHTML from 'express-minify-html';
import * as path from 'path';

import {Config} from './app.config';
import {ApplicationModule} from './app.module';

import compression = require('compression');
import dotenv = require('dotenv-safe');
import exphbs = require('express-handlebars');
import i18n = require('i18n');

dotenv.config();
const PORT: number = Number(process.env.PORT) || 3000;

async function bootstrap() {
    const server = setupViewEngine();
    const app = await NestFactory.create(ApplicationModule, new ExpressAdapter(server));
    setupMinify(app);
    await app.startAllMicroservicesAsync();
    await app.listen(PORT);
}

function setupViewEngine() {
    const expressInstance = express();
    i18n.configure({
        directory: path.join(__dirname, './public/locales'),
        locales: ['en', 'de', 'es', 'fr'],
        updateFiles: false
    });
    const hbs = exphbs.create({
        defaultLayout: 'main',
        layoutsDir: (process.env.NODE_ENV === 'development') ? 'src/views/layouts' : 'views/layouts',
        helpers: {
            t: (key, locale) => i18n.__({phrase: key, locale})
        }
    });

    expressInstance.engine('handlebars', hbs.engine);
    expressInstance.set('view engine', 'handlebars');
    expressInstance.set('views', Config.viewDirectory);

    expressInstance.disable('x-powered-by');
    expressInstance.use('/static', express.static(
        path.join(__dirname, (process.env.NODE_ENV === 'development') ? '../dist/public' : './public')));

    return expressInstance;
}

function setupMinify(app: INestApplication) {
    if (process.env.NODE_ENV !== 'development') {
        app.use(compression());
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
