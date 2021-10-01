import { Prisma, PrismaClient } from '.prisma/client'
import env from '@ltv/env'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import merge from 'lodash/merge'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import pick from 'lodash/pick'
import {
  ActionSchema, Context, Errors, GenericObject,
  ServiceSchema,
  ServiceSettingSchema
} from 'moleculer'
import { camelCase, pluralize, upperFirst } from 'shared/utils/graphql'
import { customPrismaLog } from 'shared/utils/prisma'


export type PrimaryKeyType = 'String' | 'Int'
export type PrimaryType = {
  [key: string]: PrimaryKeyType
}

export type GraphQLMixinActionOptions = {
  disabled?: boolean
  permissions?: []
}

export interface GraphqlMixinTableOptions {
  name: string
  primary: PrimaryType
}

export interface GraphqlMixinOptions {
  name?: string
  table: GraphqlMixinTableOptions
  datasource?: {
    service: string
  }
  prisma?: Prisma.PrismaClientOptions
  actions?: {
    [key: string]: GraphQLMixinActionOptions
  }
}

export interface GraphQLCreateInput<T> {
  clientMutationId?: string
  input: {
    [key: string]: T
  }
}

export interface GraphQLUpdateInputById {
  [key: string]: string
}

export interface GraphQLUpdateInput<T> {
  clientMutationId?: string
  input: {
    [key: string]: T
  }
}

export interface PrismaCreateInput<T> {
  data: T
}

function allQueryName(entityName: string) {
  return `all${pluralize(entityName)}`
}

function allQueryParams(entityName: string) {
  return `(
  # Only read the first 'n' values of the set.
  first: Int
  # Only read the last 'n' values of the set.
  last: Int
  # Skip the first 'n' values from our 'after' cursor, an alternative to cursor
  # based pagination. May not be used with 'last'.
  offset: Int
  # Read all values in the set before (above) this cursor.
  before: Cursor
  # Read all values in the set after (below) this cursor.
  after: Cursor
  # The method to use when ordering '${pluralize(entityName)}'.
  orderBy: [${pluralize(entityName)}OrderBy!] = [PRIMARY_KEY_ASC]
  # A condition to be used in determining which values should be returned by the collection.
  condition: ${entityName}Condition
  # A filter to be used in determining which values should be returned by the collection.
  filter: ${entityName}Filter
  )`
}

function singleQueryName(entityName: string) {
  return `${entityName}`.toLowerCase()
}

function combineKeys(keys: string[]) {
  return keys.map((k) => upperFirst(k)).join('And')
}

function byPrimaryQueryName(entityName: string, keys: string[]) {
  return `${singleQueryName(entityName)}By${combineKeys(keys)}`
}

function byPrimaryQueryParams(primary: PrimaryType) {
  const keys = Object.keys(primary)
  const params = keys.map((k) => `${k}: ${primary[k]}!`)
  return '(' + params.join(', ') + ')'
}

interface PrismaQueryParams {
  take: number
  skip: number
  where: GenericObject
}

interface PostgraphileQueryParams {
  first: number
  last: number
  offset: number
  before: any
  after: any
  orderBy: string[] | GenericObject
  condition: any
  filter: any
}

function transformOrderBy(orderBy: string[]) {
  type OrderBy = {
    [key: string]: 'asc' | 'desc'
  }
  return orderBy.reduce((order: OrderBy, ob) => {
    const segments = ob.split('_')
    const sort = segments[segments.length - 1]
    const field = camelCase(ob.replace(`_${sort}`, ''))
    return { ...order, [field]: sort.toLocaleLowerCase() }
  }, {})
}

const filterMap: GenericObject = {
  equalTo: 'equals',
  equalToInsensitive: 'equals',
  notEqualTo: 'not',
  notEqualToInsensitive: 'not',
  in: 'in',
  inInsensitive: 'in',
  notIn: 'notIn',
  notInInsensitive: 'notIn',
  lessThan: 'lt',
  lessThanInsensitive: 'lt',
  lessThanOrEqualTo: 'lte',
  lessThanOrEqualToInsensitive: 'lte',
  greaterThan: 'gt',
  greaterThanInsensitive: 'gt',
  greaterThanOrEqualTo: 'gte',
  greaterThanOrEqualToInsensitive: 'gte',
  includes: 'contains',
  includesInsensitive: 'contains',
  startsWith: 'startsWith',
  startsWithInsensitive: 'startsWith',
  endsWith: 'endsWith',
  endsWithInsensitive: 'endsWith',
}

function hasTotalCount(ctx: Context) {
  const query: string = (ctx?.options?.parentCtx?.params as any)?.req?.body?.query || ''
  return query.indexOf('totalCount') > 0
}

type TransformParamsType = PostgraphileQueryParams & PrismaQueryParams

function transformFilter(filter: GenericObject): GenericObject {
  if (!filter) return {}
  const keys = Object.keys(filter)
  return keys.reduce((carry, key) => {
    if (['not'].indexOf(key) !== -1) {
      return { ...carry, [key.toUpperCase()]: transformFilter(filter[key]) }
    }
    if (['and', 'or'].indexOf(key) !== -1) {
      const arr: GenericObject[] = filter[key]
      return { ...carry, [key.toUpperCase()]: arr.map((item) => transformFilter(item)) }
    }
    const conditions = filter[key]
    const condKeys = Object.keys(conditions)
    return {
      ...carry,
      ...condKeys.reduce(
        (conCarry, k) => ({ ...conCarry, [key]: { [filterMap[k]]: conditions[k] } }),
        {},
      ),
    }
  }, {})
}

function transformParams(ctx: Context<TransformParamsType>) {
  // before, after: todo
  const { first, last, offset, orderBy, filter, condition } = ctx.params
  // BELOW params should be transformed
  // include: { type: 'object', optional: true },
  // where: { type: 'object', optional: true },
  // cursor: { type: 'object', optional: true },
  // distinct: { type: 'object', optional: true }
  ctx.params.where = transformFilter(filter)
  if (condition) {
    const keys = Object.keys(condition)
    ctx.params.where = {
      ...ctx.params.where,
      ...keys.reduce((carry, k) => ({ ...carry, [k]: { equals: condition[k] } }), {}),
    }
  }

  if (orderBy) {
    ctx.params.orderBy = transformOrderBy((orderBy as string[]) || [])
    // TODO: Find good way to add primaryKey as default
    delete ctx.params.orderBy.primaryKey
  }

  ctx.params.take = last ? -last : first
  ctx.params.skip = offset

  // TODO: Will look into cursor
  ctx.params = pick(ctx.params, [
    'where',
    'orderBy',
    'take',
    'first',
    'skip',
    'cursor',
  ]) as TransformParamsType
}

function transformUpdateData(data: GenericObject) {
  const keys = Object.keys(data)
  return keys.reduce((carry, k) => ({ ...carry, [k]: { set: data[k] } }), {})
}

async function transformPayload<DataType = any>(
  responseKey: string | null,
  data: DataType | DataType[],
  options?: GraphQLTransformPayloadOptions,
): Promise<GraphQLSinglePayload<DataType> | GraphQLPayload<DataType>> {
  if (!data) {
    return null
  }

  if (isArray(data)) {
    const payload: GraphQLPayload<DataType> = {
      nodes: data,
    }

    if (isFunction(options?.totalCount)) {
      payload.totalCount = await options.totalCount()
    }

    return payload
  }

  if (!isString(responseKey)) {
    throw new Error('Require response key when return an object. Ex: { user: userData }')
  }

  return { [responseKey]: data }
}

type CreateActionGraphQLType = {
  query?: string
  mutation?: string
}

type CreateActionOptions = ActionSchema & {
  graphql: CreateActionGraphQLType
  options?: GraphQLMixinActionOptions
}

function createActions({ name, graphql, handler, options }: CreateActionOptions): ActionSchema {
  if (options?.disabled) {
    return
  }
  return {
    name,
    graphql,
    handler,
    permissions: options?.permissions,
  }
}

const defaultActionsOptions: GraphQLMixinActionOptions = {
  disabled: false,
}

function extendDefaultActionOptions(options: { [key: string]: GraphQLMixinActionOptions }): {
  [key: string]: GraphQLMixinActionOptions
} {
  options = options || {}
  const keys = Object.keys(options)
  return keys.reduce(
    (carry, k) => ({ ...carry, [k]: { ...defaultActionsOptions, ...options[k] } }),
    {},
  )
}

export function GraphQLMixin(options: GraphqlMixinOptions): ServiceSchema<ServiceSettingSchema> {
  options = { table: { name: '', primary: { id: 'Int' } }, ...(options || {}) }
  const dsServiceName = `tbl-${options.table.name.toLowerCase()}`
  if (!options.datasource) {
    options.datasource = { service: dsServiceName }
  }
  options.actions = extendDefaultActionOptions(options.actions)

  // QUERY
  const allQueryActName: string = allQueryName(options.table.name)
  const actAll: ActionSchema = createActions({
    name: allQueryActName,
    graphql: {
      query:
        allQueryActName +
        allQueryParams(options.table.name) +
        `: ${pluralize(options.table.name)}Connection`,
    },
    async handler(ctx: Context<PrismaQueryParams>) {
      this.logger.debug(`♻ [GRAPHQL]: ${allQueryActName} > params: `, ctx.params)
      // const data = await ctx.call(`${options.datasource.service}.find`, ctx.params)
      const data = await this.model.findMany(ctx.params)
      if (!isFunction(this.transformPayload)) {
        return data
      }
      const tranOpts: GraphQLTransformPayloadOptions = {}
      if (hasTotalCount(ctx)) {
        tranOpts.totalCount = () => this.model.count({ where: ctx.params.where })
      }

      return this.transformPayload(null, data, tranOpts)
    },
    options: options.actions[allQueryActName],
  })

  const byKeyQueryActName: string = byPrimaryQueryName(
    options.table.name,
    Object.keys(options.table.primary),
  )
  const actByKey: ActionSchema = createActions({
    name: byKeyQueryActName,
    graphql: {
      query:
        byKeyQueryActName + byPrimaryQueryParams(options.table.primary) + `: ${options.table.name}`,
    },
    cache: {
      enabled: true,
    },
    handler(ctx: Context<GenericObject>) {
      this.logger.debug(`♻ [GRAPHQL]: ${byKeyQueryActName} > params: `, ctx.params)
      return this.model.findUnique({ where: ctx.params })
    },
    options: options.actions[byKeyQueryActName],
  })

  const singleQueryActName: string = singleQueryName(options.table.name)
  const actSingle: ActionSchema = createActions({
    name: singleQueryActName,
    graphql: {
      query:
        singleQueryActName + `(condition: ${options.table.name}Condition!): ${options.table.name}`,
    },
    params: {
      condition: {
        type: 'object',
        optional: true,
      },
    },
    cache: {
      enabled: true,
    },
    handler(ctx: Context<PostgraphileQueryParams>) {
      this.logger.debug(`♻ [GRAPHQL]: ${singleQueryActName} > params: `, ctx.params)
      return this.model.findUnique({ where: ctx.params.condition })
    },
    options: options.actions[singleQueryActName],
  })

  // MUTATIONS
  const actCreateName = `create${options.table.name}`
  const actCreate: ActionSchema = createActions({
    name: actCreateName,
    graphql: {
      // ex: createUser(input: CreateUserInput!): CreateUserPayload
      mutation: `${actCreateName}(input: Create${options.table.name}Input!): Create${options.table.name}Payload`,
    },
    async handler(ctx: Context<GraphQLCreateInput<GenericObject>>) {
      this.logger.debug(`♻ [GRAPHQL]: ${actCreateName} > params: `, ctx.params)
      return this.model.create({
        data: ctx.params.input[camelCase(options.table.name)],
      })
    },
    options: options.actions[actCreateName],
  })

  const updateBy = combineKeys(Object.keys(options.table.primary))
  const actUpdateByIdName = `update${options.table.name}By${updateBy}`
  const actUpdateById: ActionSchema = createActions({
    name: actUpdateByIdName,
    graphql: {
      // eg: updateUser(input: UpdateUserInput!): UpdateUserPayload
      mutation: `${actUpdateByIdName}(input: Update${options.table.name}By${updateBy}Input!): Update${options.table.name}Payload`,
    },
    async handler(ctx: Context<GraphQLUpdateInput<any> & GraphQLUpdateInputById>) {
      this.logger.debug(`♻ [GRAPHQL]: ${actUpdateByIdName} > params: `, ctx.params)
      const updatePatch = ctx.params.input[camelCase(options.table.name) + 'Patch']

      return this.model.update({
        where: { id: ctx.params.input['id'] },
        data: this.transformUpdateData(omit(updatePatch, 'id')),
      })
    },
    options: options.actions[actUpdateByIdName],
  })

  const actDeleteByIdName = `delete${options.table.name}ById`
  const actDeleteById: ActionSchema = createActions({
    name: actDeleteByIdName,
    graphql: {
      // eg: deleteUser(input: DeleteUserInput!): DeleteUserPayload
      mutation: `${actDeleteByIdName}(input: Delete${options.table.name}ByIdInput!): Delete${options.table.name}Payload`,
    },
    async handler(ctx: Context<{ input: { id: string | number } }>) {
      this.logger.debug(`♻ [GRAPHQL]: ${actDeleteByIdName} > params: `, ctx.params)
      const deleted = await this.model.delete({
        where: { id: ctx.params.input['id'] },
      })

      if (!isFunction(this.transformPayload)) {
        return deleted
      }

      return {
        ...this.transformPayload(camelCase(options.table.name), deleted),
        [`deleted${options.table.name}Id`]: ctx.params.input['id'],
      }
    },
    options: options.actions[actDeleteByIdName],
  })

  const actions = omitBy(
    {
      // Query
      actAll,
      actByKey,
      actSingle,
      // Mutations
      actCreate,
      actUpdateById,
      actDeleteById,
    },
    (act) => !act,
  )

  const hooks = {
    before: {
      [allQueryActName]: transformParams,
    },
    after: {
      [actCreateName]: async (_ctx: Context, res: any) => {
        return transformPayload(camelCase(options.table.name), res)
      },
      [actUpdateByIdName]: (_ctx: Context, res: any) => {
        return transformPayload(camelCase(options.table.name), res)
      },
    },
  }

  return {
    name: options.name,
    settings: {},
    hooks,
    actions,
    methods: {
      transformParams,
      transformUpdateData,
      transformPayload,
      handleError(error: Prisma.PrismaClientKnownRequestError) {
        this.logger.error(error.message)
        return Promise.reject(
          new Errors.MoleculerClientError(error.message, 500, 'DATABASE_ERROR', error.meta),
        )
      },
    },
    created() {
      const opts: Prisma.PrismaClientOptions = {
        ...(options && options.prisma),
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ],
        errorFormat: 'minimal',
      }
      const prisma = new PrismaClient(opts)
      this.prisma = customPrismaLog(prisma, this.logger)
      this.settings = merge(this.settings, { database: { table: options?.table.name } })
    },
    async started() {
      try {
        await this.prisma.$connect()
        this.logger.debug(`Connected to database ${env('DATABASE_HOST')}:${env('DATABASE_PORT')}`)
      } catch (e) {
        throw new Errors.MoleculerServerError(`Unable to connect to database: ${env('DATABASE_HOST')}:${env('DATABASE_PORT')}`, e.message)
      }
    },
    async stopped() {
      if (this.prisma) {
        this.logger.info('Closing prisma connection...')
        await this.prisma.$disconnect()
        this.prisma = null
      }
    },
  }
}
