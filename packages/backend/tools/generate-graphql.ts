import fs from 'fs'
import path from 'path'
import { generateSchemaFromDb } from 'shared/utils/graphql'
import env from '@ltv/env'
import { PrismaClient } from '@prisma/client'

const schemas = [env('DATABASE_SCHEMA', 'public')]
const nodeEnv = env('NODE_ENV', 'development')
const isProd = () => ['prod', 'production'].indexOf(nodeEnv) != -1
const schemaPath = path.resolve(`./graphql/schema${isProd() ? '' : '-dev'}.graphql`)
const prisma = new PrismaClient()

const getTableQuery = `
SELECT table_schema,table_name, obj_description(oid) as "comment" FROM information_schema.tables
JOIN pg_class ON pg_class.relname = table_name
WHERE "table_schema" IN (${schemas.map((s) => "'" + s + "'").join(',')})
ORDER BY table_schema,table_name;
`

type Table = {
  table_schema: string
  table_name: string
  comment: string
}

async function omitAutoGeneratedTables() {
  const tables = await prisma.$queryRawUnsafe<Table[]>(getTableQuery)
  const omitTables: string[] = tables
    .filter((t: Table) => t.table_name.startsWith('_') && !`${t.comment}`.startsWith('@omit'))
    .map((t: Table) => `${t.table_schema}."${t.table_name}"`)

  if (omitTables.length > 0) {
    console.log('omit tables: ', omitTables.join(', '))
    const queries = omitTables.map((t: string) => `comment on table ${t} is E'@omit';`)
    await Promise.all(queries.map((query) => prisma.$queryRawUnsafe(query)))
  }
}

const run = async () => {
  await prisma.$connect()
  const generateTo = schemaPath
  await omitAutoGeneratedTables()

  const schema = await generateSchemaFromDb(schemas)
  console.log(`🚀 Generated GraphQL Types from database to '${generateTo}'`)
  fs.writeFileSync(generateTo, schema)
}

run()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    if (!prisma) {
      return
    }
    await prisma.$disconnect()
  })
