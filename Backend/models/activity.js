'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
  class activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      activity.belongsTo(models.user, {
        foreignKey: 'userId',
        as: 'user'
      });
      activity.belongsTo(models.resource, {
        foreignKey: 'resourceId',
        as: 'resource'
      });
    }
  }
  activity.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'User ID is required'
        },
        isUUID: {
          args: 4,
          msg: 'User ID must be a valid UUID'
        }
      }
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: {
          args: 4,
          msg: 'Resource ID must be a valid UUID'
        }
      }
    },
    actionType: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Action type is required'
        },
        isIn: {
          args: [['CREATE', 'UPDATE', 'DELETE', 'VIEW']],
          msg: 'Action type must be one of: CREATE, UPDATE, DELETE, VIEW'
        }
      }
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value !== null && typeof value !== 'object') {
            throw new Error('Details must be a valid JSON object');
          }
        }
      }
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
      validate: {
        isIP: {
          msg: 'IP address must be a valid IPv4 or IPv6 address'
        }
      }
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'User agent must be less than 2000 characters'
        }
      }
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
    modelName: 'activity',
    tableName: 'activities',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['resourceId']
      },
      {
        fields: ['actionType']
      },
      {
        fields: ['createdAt']
      }
    ]
  });
  return activity;
};