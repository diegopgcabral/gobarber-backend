import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Cadastrar Usuário
routes.post('/users', UserController.store);
// Rota para Logar usuário e validar TOKEN
routes.post('/sessions', SessionController.store);

/**
 * Todas as rotas para baixo serão validadas com o TOKEN para fazer alterações
 */
routes.use(authMiddleware);

// Atualizar dados de Usuário
routes.put('/users', UserController.update);
// Lista de Provedores
routes.get('/providers', ProviderController.index);
// Cadastrar um novo agendamento
routes.post('/appointments', AppointmentController.store);
// Exibir os agendamentos do usuário logado
routes.get('/appointments', AppointmentController.index);
// Cancelar um agendamento do usuário logado
routes.delete('/appointments/:id', AppointmentController.delete);
// Exibir o agendamento do prestador de serviço que está logado
routes.get('/schedule', ScheduleController.index);
// Listar as notificações do provider.
routes.get('/notifications', NotificationController.index);
// Marcar a notificação como lida
routes.put('/notifications/:id', NotificationController.update);
// Cadastrar um avatar para usuário
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
