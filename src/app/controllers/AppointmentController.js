import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

// subHours -> Reduz uma determinada hora de um horário

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      // Sempre diminuo "1" do número da página atual, para ele pegar sempre
      // os proximos 20 registros
      offset: (page - 1) * 20,
      include: [
        {
          /**
           * Fazendo associação com user para exibir os dados
           */
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          /**
           * Fazendo associação com File para exibir o avatar
           */
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { provider_id, date } = req.body;
    /**
     * Check if provider_id is provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers.' });
    }

    /**
     * Verifico se quem tá fazendo o agendamento é o próprio provider
     */
    if (provider_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'Provider can not make appointments' });
    }

    /**
     * Pego somente a Hora do agendamento
     */
    const hourStart = startOfHour(parseISO(date));
    /**
     * Verifico se o horário do atendimento já passou
     */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited.' });
    }
    /**
     * Verifico se o prestador de serviço já tem um agendamento no mesmo horário
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Appointment is not available.' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    /**
     * Notificar prestador de serviço
     */
    const user = await User.findByPk(req.userId);
    // O que está dentro de aspas simples não é alterado
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo Agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    // Uso include para pegar as informações na tabela de USERS
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
      ],
    });
    /**
     * Verifico se o id do usuário é diferente do id do usuário logado
     */
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }
    // Removendo 2h do horário do agendamento
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointment 2 hours in advance.',
      });
    }
    // Preencho a data de cancelamento
    appointment.canceled_at = new Date();
    // Gravo no BD a alteração
    await appointment.save();
    // Enviando email de cancelamento do agendamento
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}`,
      subject: 'Agendamento Cancelado',
      text: 'Você tem um novo cancelamento',
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
