const dbconfig = {
  synchronize: true,
  migrations: ['migrations/*.js'],
  cli: { migrationsDir: 'migration' },
};

switch (process.env.NODE_ENV) {
  case 'development':
    console.log(process.env.NODE_ENV);
    Object.assign(dbconfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.entity.js'],
    });
    break;

  case 'test':
    Object.assign(dbconfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
    });
    break;
  case 'production':
    Object.assign(dbconfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.entity.js'],
    });
    break;
  default:
    throw new Error('Unknown Enviroment');
    break;
}

module.exports = dbconfig;
