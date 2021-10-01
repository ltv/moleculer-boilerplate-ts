interface AppMeta<User = unknown> {
  userId?: string
  clientIp?: string
  token?: string
  user?: User
}

interface User {
  id: string
}

interface GraphQLTransformPayloadOptions {
  totalCount?: () => Promise<number>
}

interface GraphQLMutationInputType<T> {
  [key: string]: T
}

interface GraphQLClientMutation {
  clientMutationId: string
}

interface GraphQLMutationInput<T> {
  input: GraphQLMutationInputType<T> & GraphQLClientMutation
}

interface GraphQLSinglePayload<T> {
  [key: string]: T
}

interface GraphQLPayload<T> {
  nodes: T[]
  totalCount?: number
}

interface GraphQLQueryInput<T, FilterType = unknown> {
  first?: number
  last?: number
  offset?: number
  orderBy?: string[]
  condition?: T
  filter?: FilterType
}
