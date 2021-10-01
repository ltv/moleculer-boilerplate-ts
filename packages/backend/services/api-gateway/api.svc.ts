import env from '@ltv/env'
import { Event, Service } from 'moleculer-decorators'
import ApiService from 'moleculer-web'
import { BaseService } from 'shared/core/base.svc'
import { ApolloMixin } from 'shared/mixins/apollo-server.mixin'
import { FirebaseAuthMixin } from 'shared/mixins/firebase.mixin'
import { getCORSFromEnv } from 'shared/utils/cors'
import { routes } from './routes'

@Service({
  name: 'gateway',
  mixins: [ApiService, ApolloMixin, FirebaseAuthMixin],
  settings: {
    port: env('PORT', 4000),
    routes,
    cors: {
      origin: getCORSFromEnv(),
    },
    // use: [helmet()], // rely on reverse proxy. :D
  },
})
export default class RestAPIGateway extends BaseService {
  @Event()
  generatedSchemaFromDb(): void {
    this.invalidateGraphQLSchema()
  }
}
