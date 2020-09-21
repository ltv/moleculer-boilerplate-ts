import moleculer, {
  ActionSchema as MoleculerActionSchema,
  GenericObject,
  Service,
} from "moleculer";
import { User } from "@prisma/client";

export * from "./graphql";

export type ServiceMetadata = {
  tenantId?: string;
  userId?: string;
  roles: string[];
  token: string;
  user: User;
  clientIp?: string;
  $fileInfo: File;
  $statusCode?: number;
  $statusMessage?: string;
  $responseType?: string;
  $responseHeaders?: Record<string, string>;
  $location?: string;
};

export type UploadServiceMetadata = ServiceMetadata & File;

export class Context<T = unknown> extends moleculer.Context<
  T,
  ServiceMetadata
> {
  public locals: GenericObject = {};
}

export type CustomPermissionFunc = (ctx: Context) => Promise<boolean>;
export type ActionPermission = string | CustomPermissionFunc;

export class ActionSchema implements MoleculerActionSchema {
  permissions?: ActionPermission[];
  needEntity?: boolean;
}

export interface GraphQLMutationInputType<T> {
  [key: string]: T;
}

export interface GraphQLClientMutation {
  clientMutationId: string;
}

export interface GraphQLMutationInput<T> {
  input: GraphQLMutationInputType<T> & GraphQLClientMutation;
}

export interface GraphQLSinglePayload<T> {
  [key: string]: T;
}

export interface GraphQLPayload<T> {
  nodes: T[];
  totalCount?: number;
}

export interface GraphQLQueryInput<T, FilterType = unknown> {
  first?: number;
  last?: number;
  offset?: number;
  orderBy?: string[];
  condition?: T;
  filter?: FilterType;
}

export interface ObjectParams<T> {
  [key: string]: T;
}

export interface MenuItem {
  name: string;
  link: string;
  icon: string;
}

export type FileType = "image" | "video" | "pdf" | "json" | "geojson";

export interface File {
  filename: string;
  encoding: string;
  mimetype: string;
}

export interface S3File {
  ETag: string;
  Location: string;
  key: string;
  Key: string;
  Bucket: string;
}

export interface UploadResponse {
  file: File;
  raw: S3File;
}

export type ClassType<T> = new (...args: any) => T;

export interface BaseService extends Service {
  entityChanged: (type: string, json: any, ctx: Context) => Promise<any>;

  memoize: <P = any, R = unknown>(
    key: string,
    params: P,
    callback: () => Promise<R>
  ) => Promise<R>;
}

export class BaseService extends Service implements BaseService {
  protected configs: GenericObject = {};
}

export enum AuthSpecialRole {
  SYSTEM = "$system",
  EVERYONE = "$everyone",
  AUTHENTICATED = "$authenticated",
  OWNER = "$owner",
}
