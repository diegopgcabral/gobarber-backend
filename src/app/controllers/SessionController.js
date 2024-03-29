import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import File from '../models/File';
import User from '../models/User';
import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { email, password } = req.body;

    /**
     * Verifico se existe usuário para esse email
     */
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    /**
     * Verifico se o passwaor está correto
     */
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, avatar, provider } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider,
      },
      /**
       * 1º PayLoad = ID do usuário,
       * 2º Senha Gerada no MD5 Online,
       * 3º Definir a data de expiração do token
       */
      token: jwt.sign({ id }, auth.secret, {
        expiresIn: auth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
