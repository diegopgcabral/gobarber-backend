// Configuração do servidor express...
import express from 'express';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();
    // Inicializando o Sentry
    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    // The request handler must be the first middleware on the app
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    // express.static -> usada para buscar o path onde o arquivo se encontra
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    // The error handler must be before any other error middleware and after
    // all controllers
    this.server.use(Sentry.Handlers.errorHandler());
  }

  // middleware para tratamento de exceções
  // 1º Param. precisa ser o erro
  // Quando um middleware recebe 4 parametros ele é reconhecido como um middleware
  // de tratamento de exceções
  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
