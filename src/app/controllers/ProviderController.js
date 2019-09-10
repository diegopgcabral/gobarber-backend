import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const provider = await User.findAll({
      where: { provider: true },
      // attributes -> são os campos que quero devolver no JSON
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // include -> Relacionamento com as outras tabelas
      include: [
        {
          model: File,
          // Esse codinome está sendo feito no model de USER
          as: 'avatar',
          attributes: ['name', 'url', 'path'],
        },
      ],
    });
    return res.json(provider);
  }
}

export default new ProviderController();
