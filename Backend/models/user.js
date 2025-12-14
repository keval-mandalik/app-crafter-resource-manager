'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasMany(models.resource, {
        foreignKey: 'createdByUserId'
      });
      user.hasMany(models.activity, {
        foreignKey: 'userId',
        as: 'activities'
      });
    }
  }
  user.init({
    id: {
       type: DataTypes.UUID,
       primaryKey: true,
       defaultValue: DataTypes.UUIDV4,
       allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('CONTENT_MANAGER', 'VIEWER'),
        allowNull: false,
        defaultValue: 'VIEWER'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};