import { Pool, PoolConfig } from 'pg';

let poolInstance: Pool;

export function getConnectionConfig(): PoolConfig {
  const {
    DATABASE_USER: user,
    DATABASE_PASS: password,
    DATABASE_HOST: host,
    DATABASE_PORT: port,
    DATABASE_NAME: database,
    DATABASE_SSL: ssl
  } = process.env;

  return {
    host,
    database,
    user,
    password,
    port: +port,
    ssl: !!ssl
  };
}

export function createPGPoolInstance(): Pool {
  const cConfig = getConnectionConfig();
  if (!poolInstance) {
    poolInstance = new Pool(cConfig);
  }
  return poolInstance;
}
