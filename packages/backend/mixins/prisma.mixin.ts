import { PrismaClient, PrismaClientOptions } from '@prisma/client';
import { Context, ServiceSchema, ServiceSettingSchema } from 'moleculer';
import { DatabaseError } from 'errors';

export interface PrismaMixinOptions<ModelDelegate> {
  name?: string;
  prisma: {
    options?: PrismaClientOptions;
    model: (prisma: PrismaClient) => ModelDelegate;
  };
}

export interface MutationInput<T> {
  entity: T;
  id?: string | number;
}

export interface QueryInput<T> {
  where?: T;
  searchFields?: T;
  sort?: T;
  limit?: number;
  offset?: number;
  lstIds?: number[];
}

export function PrismaMixin<ModelDelegate, ModelType>(
  options: PrismaMixinOptions<ModelDelegate>
): ServiceSchema<ServiceSettingSchema> {
  const schema: ServiceSchema<ServiceSettingSchema> = {
    name: options?.name,
    created() {
      this.prisma = new PrismaClient(options?.prisma?.options);
    },
    methods: {
      model(): ModelDelegate {
        return <ModelDelegate>options?.prisma.model(this.prisma);
      }
    },
    actions: {
      create: {
        params: {
          entity: { type: 'object' }
        },
        handler<T>(ctx: Context<MutationInput<T>>) {
          const { entity } = ctx.params;
          const data = {
            ...entity,
            creator: this.createdBy(ctx)
          };

          return this.model()
            .create({ data })
            .catch((error: Error) => DatabaseError.invalidInvocation(error.message).reject());
        }
      },
      updateById: {
        params: {
          input: { type: 'object' },
          id: { type: 'number' }
        },
        handler<T>(ctx: Context<MutationInput<T>>) {
          const { id, entity } = ctx.params;
          return this.model()
            .update({ data: entity, where: { id } })
            .catch((error: Error) => DatabaseError.notFound(error.message).reject());
        }
      },
      deleteById: {
        params: {
          id: { type: 'number' }
        },
        handler<T>(ctx: Context<MutationInput<T>>) {
          const { id } = ctx.params;
          return this.model()
            .delete({ where: { id } })
            .catch((error: Error) => DatabaseError.notFound(error.message).reject());
        }
      },
      count: {
        permissions: ['$admin', 'projects.count'],
        params: {
          where: { type: 'object', optional: true, default: {} }
        },
        handler<T>(ctx: Context<QueryInput<T>>) {
          const { where } = ctx.params;
          return this.model().count({ where });
        }
      },
      find: {
        params: {
          where: { type: 'object', optional: true },
          searchFields: { type: 'object', optional: true },
          sort: { type: 'object', optional: true },
          limit: { type: 'number', optional: true },
          offset: { type: 'number', optional: true }
        },
        async handler<T>(ctx: Context<QueryInput<T>>) {
          const { where, limit, offset, searchFields, sort } = ctx.params;
          let condition: T = where;
          let pagination: any = {};
          const orderBy: T = sort || undefined;
          // has limit and offset
          if (limit && offset) {
            pagination = { skip: (offset - 1) * limit, take: limit };
          }
          // has searchFields
          let objSearch: any = {};
          if (searchFields) {
            for (const prop in searchFields) {
              objSearch = { ...objSearch, [`${prop}`]: { contains: searchFields[prop] } };
            }
            condition = { ...condition, ...objSearch };
          }

          // excute the query
          return this.model().findMany({
            where: condition,
            ...pagination,
            orderBy
          });
        }
      },
      findOne: {
        params: {
          where: { type: 'object' }
        },
        cache: {
          keys: ['where']
        },
        handler<T>(ctx: Context<QueryInput<T>>) {
          const { where } = ctx.params;
          return this.model().findOne({ where });
        }
      },
      findById: {
        // params: {
        //   id: [{ type: 'number' }, { type: 'string' }]
        // }, // TODO: Check fastest-validator about mixin types
        cache: {
          keys: ['id']
        },
        handler<T>(ctx: Context<MutationInput<T>>) {
          const { id } = ctx.params;
          return this.model().findOne({ where: { id } });
        }
      }
    }
  };

  return schema;
}
