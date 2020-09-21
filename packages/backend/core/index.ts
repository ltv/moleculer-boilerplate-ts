import { GraphQLPayload, GraphQLSinglePayload } from '@app/types';
import { Context } from '@ltv/moleculer-core';
import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';
import isArray from 'lodash.isarray';
import isFunction from 'lodash.isfunction';
import isString from 'lodash.isstring';
import { Service, ServiceBroker, ServiceSchema } from 'moleculer';

export interface MemoizeOptions {
  ttl?: number;
}

export class BaseService extends Service {
  protected async memoize<T>(
    name: string,
    params: any,
    callback: () => Promise<T>,
    options?: MemoizeOptions
  ): Promise<T> {
    if (!this.broker.cacher) return callback();

    const key = this.broker.cacher.defaultKeygen(`${name}:memoize-${name}`, params, {}, []);

    let res = await this.broker.cacher.get(key);
    if (res) return <T>res;

    res = await callback();
    this.broker.cacher.set(key, res, options?.ttl);

    return <T>res;
  }
}

export interface GraphQLTransformPayloadOptions {
  totalCount: () => Promise<number>;
}

export class GraphQLService extends BaseService {
  constructor(broker: ServiceBroker, schema?: ServiceSchema) {
    super(broker, schema);
  }

  protected async transformPayload<DataType = any>(
    responseKey: string | null,
    data: DataType | DataType[],
    options?: GraphQLTransformPayloadOptions
  ): Promise<GraphQLSinglePayload<DataType> | GraphQLPayload<DataType>> {
    if (!data) {
      return null;
    }

    if (isArray(data)) {
      const payload: GraphQLPayload<DataType> = {
        nodes: data
      };

      if (isFunction(options?.totalCount)) {
        payload.totalCount = await options.totalCount();
      }

      return payload;
    }

    if (!isString(responseKey)) {
      throw new Error('Require response key when return an object. Ex: { user: userData }');
    }

    return { [responseKey]: data };
  }
}

export class DbService<T> extends BaseService {
  adapter!: T;
}

export class PrismaService<ModelDelegate> extends BaseService {
  public prisma!: PrismaClient;
  public model: () => ModelDelegate;
  public createdBy(ctx: Context) {
    return { connect: { id: ctx.meta.userId } };
  }
}

type onBeforeCall = (ctx: Context, route: Route, req: IncomingMessage, res: ServerResponse) => void;
type onAfterCall = (
  ctx: Context,
  route: Route,
  req: IncomingMessage,
  res: ServerResponse,
  data: any
) => void;

type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => void;

interface CorsOptions {
  origin?: boolean | string | RegExp | (string | RegExp)[] | CustomOrigin;
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export class Route {
  callOptions?: any;
  cors?: CorsOptions;
  etag?: boolean | 'weak' | 'strong' | Function;
  hasWhitelist?: boolean;
  logging?: boolean;
  mappingPolicy?: string;
  middlewares?: Array<Function>;
  onBeforeCall?: onBeforeCall;
  onAfterCall?: onAfterCall;
  opts?: any;
  path: string;
  whitelist?: Array<string>;
  aliases?: {
    [key: string]: any;
  };
  use?: any[];
  bodyParsers?: any;
}
