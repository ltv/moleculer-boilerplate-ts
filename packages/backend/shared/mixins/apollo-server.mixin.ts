/* eslint-disable @typescript-eslint/no-explicit-any */
import env from '@ltv/env'
import fs from 'fs'
import { Kind } from 'graphql'
import isString from 'lodash/isString'
import { ApolloService, GraphQLUpload } from 'moleculer-apollo-server'
import path from 'path'

const nodeEnv = env('NODE_ENV', 'development')
const isProd = () => ['prod', 'production'].indexOf(nodeEnv) != -1

const schemaPath = path.resolve(`./graphql/schema${isProd() ? '' : '-dev'}.graphql`)

if (!fs.existsSync(schemaPath)) {
  console.log('The graphql schema does not exists, please generate first')
  process.exit(1)
}

const schema = fs.readFileSync(schemaPath, { encoding: 'utf8' })

export const ApolloMixin = ApolloService({
  // Global GraphQL typeDefs
  typeDefs: `
    type AppVersion {
      dashboard: String
      api: String
    }

    scalar Date
    scalar Timestamp
    scalar Upload

    """
    This type describes a File entity.
    """
    type File {
      filename: String!
      encoding: String!
      mimetype: String!
    }

    """
    This type describes a S3File entity.
    """
    type S3File {
      ETag: String!
      Location: String!
      key: String!
      Key: String!
      Bucket: String!
    }

    ${schema}
  `,

  // Global resolvers
  resolvers: {
    Node: {
      __resolveType(obj: any) {
        return obj.__typename
      },
    },
    Date: {
      __parseValue(value: string | Date) {
        return new Date(value) // value from the client
      },
      __serialize(value: any) {
        return isString(value) ? value : value.toISOString().split('T')[0] // value sent to the client
      },
      __parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) return parseInt(ast.value, 10) // ast value is always in string format

        return undefined
      },
    },
    Timestamp: {
      __parseValue(value: any) {
        return new Date(value) // value from the client
      },
      __serialize(value: any) {
        return isString(value) ? value : value.toISOString() // value sent to the client
      },
      __parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) return parseInt(ast.value, 10) // ast value is always in string format

        return undefined
      },
    },
    Upload: GraphQLUpload,
  },

  routeOptions: {
    path: '/graphql',
    authentication: true,
    cors: true,
    mappingPolicy: 'restrict',
  },

  serverOptions: {
    playground: false,
    introspection: true,
    tracing: false,
    // engine: {
    //   apiKey: env('APOLLO_KEY'),
    //   reportSchema: true,
    //   variant: 'current',
    // } as any,
  },
})
