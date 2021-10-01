/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { PrismaClient } from '.prisma/client'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import has from 'lodash/has'
import lowerFirst from 'lodash/lowerFirst'
import { BaseService } from 'shared/core/base.svc'

export class GraphQLService<ModelDelegate = any> extends BaseService {
  // database (S)
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
  // database (E)

  // graphql (S)
  protected async transformPayload<DataType = any>(
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
  // graphql (E)
}
