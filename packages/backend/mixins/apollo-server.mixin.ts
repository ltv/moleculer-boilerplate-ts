import fs from 'fs';
import { Kind } from 'graphql';
import isString from 'lodash.isstring';
import { ApolloService, GraphQLUpload } from 'moleculer-apollo-server';
import path from 'path';

// const isProd = () => ['prod', 'production'].indexOf(process.env.NODE_ENV) != -1;

const schema = fs.readFileSync(path.resolve('./graphql/schema.graphql'), {
  encoding: 'utf8'
});

export const ApolloMixin = ApolloService({
  // Global GraphQL typeDefs
  typeDefs: `
    scalar Date
    scalar Timestamp
    ${schema}
  `,

  // Global resolvers
  resolvers: {
    Node: {
      __resolveType(obj: any) {
        return obj.__typename;
      }
    },
    Date: {
      __parseValue(value: any) {
        return new Date(value); // value from the client
      },
      __serialize(value: any) {
        return isString(value) ? value : value.toISOString().split('T')[0]; // value sent to the client
      },
      __parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) return parseInt(ast.value, 10); // ast value is always in string format

        return undefined;
      }
    },
    Timestamp: {
      __parseValue(value: any) {
        return new Date(value); // value from the client
      },
      __serialize(value: any) {
        return isString(value) ? value : value.toISOString(); // value sent to the client
      },
      __parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) return parseInt(ast.value, 10); // ast value is always in string format

        return undefined;
      }
    },
    Upload: GraphQLUpload
  },

  routeOptions: {
    path: '/graphql',
    authentication: true,
    cors: true,
    mappingPolicy: 'restrict'
  },

  serverOptions: {
    playground: true,
    introspection: true,
    tracing: true,
    engine: {
      apiKey: process.env.APOLLO_KEY,
      reportSchema: true,
      variant: 'current'
    } as any
  }
});
