import User from '../models/User';
import Notification from '../schemas/Notification';

/**
 * Essa rota só será acessada por prestador de serviço
 */
class NotificationController {
  async index(req, res) {
    /**
     * Check if provider_id is provider
     */
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications.' });
    }
    /**
     * Listar as notificações
     * Ordenando por data de criação
     * limitando o número de resultados
     */
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      // Digo o que quero atualizar no BD
      { read: true },
      // Retorna o registro atualizado
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
