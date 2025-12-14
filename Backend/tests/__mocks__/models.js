// Mock Sequelize models for testing
const mockSequelize = {
  close: jest.fn().mockResolvedValue(undefined),
  authenticate: jest.fn().mockResolvedValue(undefined),
  sync: jest.fn().mockResolvedValue(undefined)
};

const mockUser = {
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockResource = {
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockActivity = {
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

module.exports = {
  sequelize: mockSequelize,
  Sequelize: {
    DataTypes: {
      STRING: 'STRING',
      TEXT: 'TEXT',
      INTEGER: 'INTEGER',
      UUID: 'UUID',
      ENUM: 'ENUM',
      JSON: 'JSON',
      DATE: 'DATE',
      INET: 'INET'
    },
    Op: {
      or: Symbol('or'),
      and: Symbol('and'),
      gte: Symbol('gte'),
      lte: Symbol('lte'),
      like: Symbol('like'),
      iLike: Symbol('iLike'),
      in: Symbol('in'),
      notIn: Symbol('notIn')
    }
  },
  User: mockUser,
  Resource: mockResource,
  Activity: mockActivity
};