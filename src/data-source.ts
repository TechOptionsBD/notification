// src/datasource.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const isCompiled = __filename.endsWith('.js');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    path.join(
      __dirname,
      isCompiled ? '../**/*.entity.js' : '../**/*.entity.ts',
    ),
  ],
  migrations: [
    path.join(
      __dirname,
      isCompiled ? '../migrations/*.js' : '../migrations/*.ts',
    ),
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  // logging: process.env.NODE_ENV !== 'production',
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export default AppDataSource;
