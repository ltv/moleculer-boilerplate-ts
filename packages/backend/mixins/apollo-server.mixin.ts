import isString from 'lodash.isstring';
import { Kind } from 'graphql';
import { ApolloService } from 'moleculer-apollo-server';
import { isProd } from 'utils/environment';

export const ApolloMixin = ApolloService({
  // Global GraphQL typeDefs
  typeDefs: `
    scalar Date
    scalar Timestamp

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
    }

    interface Response {
      totalCount: Int
      pageInfo: PageInfo
    }

    type BaseCounter {
      completed: Int
      progress: Int
      total: Int
    }
  `,

  // Global resolvers
  resolvers: {
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
    }
  },

  routeOptions: {
    path: '/graphql',
    // authentication: false,
    authentication: true,
    cors: true,
    mappingPolicy: 'restrict'
  } as any,

  serverOptions: {
    playground: true,
    introspection: true,
    tracing: isProd(),
    engine: {
      apiKey: process.env.APOLLO_ENGINE_KEY
    }
  }
});
