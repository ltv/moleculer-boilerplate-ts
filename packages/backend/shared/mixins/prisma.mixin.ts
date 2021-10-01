import env from '@ltv/env'
import { Prisma, PrismaClient } from '@prisma/client'
import merge from 'lodash/merge'
import {
  ActionSchema,
  Context,
  Errors,
  GenericObject,
  ServiceSchema,
  ServiceSettingSchema
} from 'moleculer'

export interface PrismaMixinOptions {
  name?: string
  prisma: {
    options?: Prisma.PrismaClientOptions
    model: string
  }
  graphql?: boolean
  permissions?: {
    [action: string]: string[]
  }
  createActions?: boolean
}

const defaultOptions: Partial<PrismaMixinOptions> = {
  createActions: true
}

export function PrismaMixin(pmo: PrismaMixinOptions): ServiceSchema<ServiceSettingSchema> {
  let actions: ActionSchema = {}
  const options = merge(defaultOptions, pmo)

  if (options.createActions) {
    actions = {
      create: {
        params: {
          data: { type: 'object' },
        },
        handler(ctx: Context) {
          return this.model.create(ctx.params).catch(this.handleError)
        },
      },
      updateById: {
        params: {
          data: { type: 'object' },
          id: { type: 'any' },
        },
        handler(ctx: Context<GenericObject>) {
          const { id, data } = ctx.params
          return this.model.update({ data, where: { id } }).catch(this.handleError)
        },
      },
      deleteById: {
        params: {
          id: { type: 'any' },
        },
        handler(ctx: Context<{ id: string | number }>) {
          const { id } = ctx.params
          return this.model.delete({ where: { id } }).catch(this.handleError)
        },
      },
      count: {
        params: {
          select: { type: 'object', optional: true },
          include: { type: 'object', optional: true },
          where: { type: 'object', optional: true },
          orderBy: { type: 'object', optional: true },
          cursor: { type: 'object', optional: true },
          take: { type: 'number', optional: true },
          skip: { type: 'number', optional: true },
          distinct: { type: 'object', optional: true },
        },
        handler(ctx: Context<GenericObject>) {
          const { select, include, where, orderBy, cursor, take, skip, distinct } = ctx.params
          return this.model.count({
            select,
            include,
            where,
            orderBy,
            cursor,
            take,
            skip,
            distinct,
          })
        },
      },
      find: {
        params: {
          select: { type: 'object', optional: true },
          include: { type: 'object', optional: true },
          where: { type: 'object', optional: true },
          orderBy: { type: 'object', optional: true },
          cursor: { type: 'object', optional: true },
          take: { type: 'number', optional: true },
          skip: { type: 'number', optional: true },
          distinct: { type: 'object', optional: true },
        },
        cache: {
          enabled: true,
        },
        async handler(ctx: Context<GenericObject>) {
          const { select, include, where, orderBy, cursor, take, skip, distinct } = ctx.params
          return this.model
            .findMany({
              select,
              include,
              where,
              orderBy,
              cursor,
              take,
              skip,
              distinct,
            })
            .catch(this.handleError)
        },
      },
      findOne: {
        params: {
          select: { type: 'object', optional: true },
          include: { type: 'object', optional: true },
          where: { type: 'object', optional: true },
        },
        cache: {
          enabled: true,
        },
        handler(ctx: Context<GenericObject>) {
          const { select, include, where } = ctx.params
          return this.model.findOne({ select, include, where })
        },
      },
    }
    const permissions = options.permissions || {}
    const actionNames = Object.keys(permissions)
    actionNames.forEach((action) => {
      actions[action].permissions = permissions[action] || []
    })
  }

  return {
    name: options && options.name,
    created() {
      const opts: Prisma.PrismaClientOptions = {
        ...(options && options.prisma && options.prisma.options),
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ],
        errorFormat: 'minimal',
      }
      const prisma = new PrismaClient(opts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma.$on<any>('query', (e: Prisma.QueryEvent) => {
        this.logger.info(
          '\n\x1b[36m -> Query: \x1b[0m',
          `\x1b[35m ${e.query} \x1b[0m`,
          '\n\x1b[36m -> Params: \x1b[0m',
          `\x1b[35m ${e.params} \x1b[0m`,
          '\n\x1b[36m -> Duration: \x1b[0m',
          `\x1b[35m ${e.duration} \x1b[0m`,
        )
      })
      // prisma.$on<any>('info', (e: Prisma.LogEvent) => {
      //   this.logger.info(e.message)
      // })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma.$on<any>('error', (e: Prisma.LogEvent) => {
        this.logger.error(e.message)
      })
      this.prisma = prisma
      this.settings = merge(this.settings, { database: { table: options?.prisma.model } })
    },
    async started() {
      try {
        await this.prisma.$connect()
        this.logger.debug(`Connected to database ${env('DATABASE_HOST')}:${env('DATABASE_PORT')}`)
      } catch (e) {
        throw new Errors.MoleculerServerError('Unable to connect to database.', e.message)
      }
    },
    async stopped() {
      if (this.prisma) {
        this.logger.info('Closing prisma connection...')
        await this.prisma.$disconnect()
        this.prisma = null
      }
    },
    methods: {
      handleError(error: Prisma.PrismaClientKnownRequestError) {
        this.logger.error(error.message)
        return Promise.reject(
          new Errors.MoleculerClientError(error.message, 500, 'DATABASE_ERROR', error.meta),
        )
      },
    },
    actions,
  } as ServiceSchema<ServiceSettingSchema>
}
