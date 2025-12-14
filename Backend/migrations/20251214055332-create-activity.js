'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'resources',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      actionType: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW'),
        allowNull: false
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.INET,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('activities', ['userId'], {
      name: 'idx_activities_user_id'
    });
    
    await queryInterface.addIndex('activities', ['resourceId'], {
      name: 'idx_activities_resource_id'
    });
    
    await queryInterface.addIndex('activities', ['actionType'], {
      name: 'idx_activities_action_type'
    });
    
    await queryInterface.addIndex('activities', ['createdAt'], {
      name: 'idx_activities_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activities');
  }
};
