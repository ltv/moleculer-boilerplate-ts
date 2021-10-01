/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'
import has from 'lodash/has'
import lowerFirst from 'lodash/lowerFirst'
import { Context, GenericObject, ServiceSettingSchema } from 'moleculer'
import { BaseService } from './base.svc'

export interface DatabaseSettings {
  table: string
}
export interface BaseServiceSettings extends ServiceSettingSchema {
  database?: DatabaseSettings
}

export type MemoizeOptions = {
  ttl?: number
}

export class PrismaService<ModelDelegate> extends BaseService {
  public prisma!: PrismaClient
  public get model(): ModelDelegate {
    const name = this.settings.database?.table
    if (!name) {
      return null
    }
    if (!has(this.prisma, lowerFirst(name))) {
      return null
    }
    return (this.prisma as any)[lowerFirst(name)]
  }
  public config: GenericObject = {}

  public createdBy(ctx: Context<unknown, AppMeta>) {
    return { connect: { id: ctx.meta.userId } }
  }

  public transformUpdateInput<T>(data: GenericObject) {
    const keys = Object.keys(data)
    return keys.reduce((carry, key) => ({ ...carry, [key]: { set: data[key] } }), {}) as T
  }
}
