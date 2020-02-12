import Knex, { QueryBuilder } from 'knex';
// import { Memoize } from 'mixins/memoize.mixin';
import { Service } from 'moleculer';
import { Context } from '@app/types';
// import { PageInfo } from '@ltv/lc.models';

export class BaseService extends Service {
  // GQLResponse: <T>(data: T[], totalCount?: number, pageInfo?: PageInfo) => any;
  db: (options?: { schema?: string; table: string }) => QueryBuilder;
  knex: () => Knex;
  // memoize: Memoize;

  find: <T = any[]>(where?: { [key: string]: number | boolean | string }) => T;

  insert: <T = any>(entity: any, returning?: string | string[]) => T;

  update: <T = any>(opts: {
    field: string;
    value: any;
    entity: any;
    returning?: string | string[];
  }) => T;

  delete: <T = any>(opts: {
    field: string;
    value: any;
    returning?: string | string[];
  }) => T;

  clean: () => void;

  entityChanged: (type: string, json: any, ctx: Context) => Promise<any>;

  clearCache: () => Promise<any>;

  forceCleanCache: (keys: string[] | string) => void;

  delCache: (keys: string[] | string) => void;

  nextval: (seqNm: string) => number;

  encodeHex: (entityId: number) => string;

  decodeHex: (code: string) => number;
}
