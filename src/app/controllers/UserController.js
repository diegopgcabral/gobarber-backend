import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    /**
     * Realizando validações dos campos para cadastro de um novo usuário
     */
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });
    // Valido se o usuário já está cadastrado na base
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    /**
     * Realizando validações dos campos para atualização de um usuário
     */
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { email, oldPassword } = req.body;
    // Busco as informações do usuário logado
    const user = await User.findByPk(req.userId);
    // Verifico se o email passado no Body é diferente do que está registrado
    // na base
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }
    /**
     * Verifico se a senha que ele está passando é == a senha cadastrada e
     * a oldPassword está preenchido
     */
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }
    /**
     * Atualizo as informações do usuário
     */
    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    /**
     * Retorno as informações.
     */
    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
