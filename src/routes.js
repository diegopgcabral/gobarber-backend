import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Cadastrar Usuário
routes.post('/users', UserController.store);
// Rota para Logar usuário e validar TOKEN
routes.post('/sessions', SessionController.store);

/**
 * Todas as rotas para baixar serão validadas com o TOKEN para fazer alterações
 */
routes.use(authMiddleware);

// Atualizar dados de Usuário
routes.put('/users', UserController.update);

export default routes;
