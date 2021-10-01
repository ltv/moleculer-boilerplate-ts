import { Pool, PoolConfig } from 'pg'
import env from '@ltv/env'

let poolInstance: Pool

export function getConnectionConfig(): PoolConfig {
  const host = env<string>('DATABASE_HOST')
  const database = env<string>('DATABASE_NAME')
  const user = env<string>('DATABASE_USER')
  const password = env<string>('DATABASE_PASS')
  const port = env.int('DATABASE_PORT', 5432)
  const ssl = env.bool('DATABASE_SSL', false)

  const min = env.int('DATABASE_POOL_MIN', 1)
  const max = env.int('DATABASE_POOL_MAX', 3)

  return {
    host,
    database,
    user,
    password,
    port,
    ssl,

    // pool min, max
    min,
    max,
  }
}

export function createPGPoolInstance(): Pool {
  const cConfig = getConnectionConfig()
  if (!poolInstance) {
    poolInstance = new Pool(cConfig)
  }
  return poolInstance
}
