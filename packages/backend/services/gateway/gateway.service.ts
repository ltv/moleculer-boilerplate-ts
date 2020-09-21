import { enhanceResJson } from '@ltv/moleculer-core';
import { BaseService } from 'core';
import helmet from 'helmet';
import { ApolloMixin } from 'mixins/apollo-server.mixin';
import { FirebaseAuthMixin } from 'mixins/auth/firebase.mixin';
import { Event, Service } from 'moleculer-decorators';
import ApiService from 'moleculer-web';
import { getOriginEnv } from 'utils';
import { SVC_GATEWAY } from 'utils/constants';
import { routes } from './routes';

@Service({
  name: SVC_GATEWAY,
  mixins: [ApiService, ApolloMixin, FirebaseAuthMixin],
  settings: {
    port: +process.env.APP_PORT || 3000,
    routes,
    cors: {
      origin: getOriginEnv()
    },
    use: [helmet(), enhanceResJson]
  }
})
export default class ServiceGateway extends BaseService {
  @Event()
  generatedSchemaFromDb() {
    console.log('[generatedSchemaFromDb]');
    this.invalidateGraphQLSchema();
  }
}
