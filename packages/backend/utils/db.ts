// import { PoolConfig } from 'pg';
import Knex, { ConnectionConfig } from 'knex';

let knexInstance: Knex;

export function getKnexDbConfigs(): Knex.Config {
  const {
    DATABASE_USER,
    DATABASE_PASS,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_SSL,
    DATABASE_POOL_MIN,
    DATABASE_POOL_MAX
  } = process.env;

  const connection: ConnectionConfig = {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    database: DATABASE_NAME,
    user: DATABASE_USER,
    password: DATABASE_PASS,
    ssl: DATABASE_SSL
  } as any;

  let min = 0;
  let max = 1;
  try {
    min = parseInt(DATABASE_POOL_MIN);
    max = parseInt(DATABASE_POOL_MAX);
  } catch (e) {}

  const configs = {
    client: 'postgresql',
    connection,
    pool: { min, max }
  };
  return configs;
}

export function createKnexInstance(): Knex {
  const configs = getKnexDbConfigs();
  if (!knexInstance) {
    knexInstance = Knex(configs);
  }
  return knexInstance;
}
