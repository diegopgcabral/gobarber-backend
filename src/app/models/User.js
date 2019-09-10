import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        /**
         * Defino todos os campos de Users que serão usados na APP
         */
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    /**
     * Gerando o Hash da senha do usuário
     */
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // as: Está passando um Codinome para o relacionamento
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  /**
   * Verifico se a senha passada é igual a cadastrada no BD
   */
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
