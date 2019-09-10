import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

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

// Cadastrar um avatar para um usuário
routes.post('/files', upload.single('file'), (req, res) => {
  return res.json({ ok: true });
});

export default routes;
