'use strict';
const {
  Model, DataTypes
} = require('sequelize');
module.exports = (sequelize) => {
  class resource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      resource.belongsTo(models.user, {
        as: 'creator',
        foreignKey: 'createdByUserId'
      });
      resource.hasMany(models.activity, {
        foreignKey: 'resourceId',
        as: 'activities'
      });
    }
  }
  resource.init({
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('Article', 'Video', 'Tutorial'),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tags: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Published', 'Archived'),
        allowNull: false,
        defaultValue: 'Draft'
      },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    modelName: 'resource',
  });
  return resource;
};