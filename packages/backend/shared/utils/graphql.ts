import { printSchema } from 'graphql/utilities'
import _camelCase from 'lodash/camelCase'
import _upperFirst from 'lodash/upperFirst'
import { ActionParams } from 'moleculer'
import plz from 'pluralize'
import { createPostGraphileSchema, Plugin } from 'postgraphile-core'
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter'
import { createPGPoolInstance } from 'shared/utils/db'

export const constantCaseAll = (str: string): string =>
  str
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/[A-Z]+/g, '_$&')
    .replace(/__+/g, '_')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/^[0-9]/, '_$&') // GraphQL enums must not start with a number
    .toUpperCase()

export const formatInsideUnderscores =
  (fn: (input: string) => string) =>
  (str: string): string => {
    const matches = str.match(/^(_*)([\s\S]*?)(_*)$/)
    if (!matches) {
      throw new Error('Impossible?') // Satiate Flow
    }
    const [, start, middle, end] = matches
    return `${start}${fn(middle)}${end}`
  }

export const upperFirst = formatInsideUnderscores(_upperFirst)
export const camelCase = formatInsideUnderscores(_camelCase)
export const constantCase = formatInsideUnderscores(constantCaseAll)
export const upperCamelCase = (str: string): string => upperFirst(camelCase(str))

export const pluralize = (str: string): string => plz(str)
export const singularize = (str: string): string => plz.singular(str)

export default {}

interface TypeTracer {
  [key: string]: boolean
}

async function generateGraphQLFromDbSchema(schemaName: string, typeTracer: TypeTracer) {
  const options = { commentDescriptions: true }
  const schema = await createPostGraphileSchema(createPGPoolInstance(), schemaName, {
    appendPlugins: [ConnectionFilterPlugin as Plugin],
    graphileBuildOptions: { connectionFilterAllowEmptyObjectInput: true },
  })
  const typeMaps: any = (schema as any)._typeMap
  const typeKeys: string[] = Object.keys(typeMaps).filter((t) => !t.startsWith('_'))

  typeKeys.forEach((type) => {
    if (typeTracer[type] || type.indexOf('Migration') !== -1) {
      delete (schema as any)._typeMap[type]
    }
    typeTracer[type] = true
  })

  // remove unused types
  Object.keys(typeMaps)
    .filter((t) => t.startsWith('_'))
    .forEach((t) => delete (schema as any)._typeMap[t])

  return printSchema(schema as any, options)
}

export async function generateSchemaFromDb(
  schemas: string[],
  typeTracer?: TypeTracer,
): Promise<string> {
  typeTracer = {
    Query: true,
    Mutation: true,
    String: true,
    Boolean: true,
    ...(typeTracer || {}),
  }
  const generated: string[] = await Promise.all(
    schemas.map((dbSchema) => generateGraphQLFromDbSchema(dbSchema, typeTracer)),
  )

  return generated.join('\n')
}

export function createGraphQLInputParams(
  props: ActionParams,
  options?: { optional?: boolean; key?: string },
): ActionParams {
  options = options || { optional: false }

  const { optional, key } = options
  props = key ? { props: { key: { type: 'object', props } } } : props
  return {
    input: {
      type: 'object',
      optional,
      props,
    },
  }
}
