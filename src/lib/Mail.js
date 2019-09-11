import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    /**
     * Buscando as configurações de Mail.
     */
    const { host, port, secure, auth } = mailConfig;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      // Se não tiver um usuário na autenticação, envio null
      auth: auth.user ? auth : null,
    });
  }

  // ...mailConfig.default -> pega tudo que está dentro de default
  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
