import * as ApiService from 'moleculer-web';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { ServiceSchema } from 'moleculer';

import { enhanceResJson } from 'utils';
import { SERVICE_GATEWAY } from 'utils/constants';
import { I18NextMixin } from 'mixins/i18next.mixin';
import { ApolloMixin } from 'mixins/apollo-server.mixin';

import { authenticate } from './utils';
import { routes } from './routes';

const ApiGateway: ServiceSchema = {
  name: SERVICE_GATEWAY,
  mixins: [ApiService, ApolloMixin, I18NextMixin()],

  settings: {
    port: +process.env.APP_PORT || 3000,
    // http2: true,

    gateway: {},

    cors: {
      origin: '*'
    },

    use: [
      helmet(), //
      enhanceResJson,
      bodyParser.json({ limit: '2MB' }),
      bodyParser.urlencoded({ extended: true, limit: '2MB' })
    ],

    routes
  },

  methods: {
    authenticate
  }
};

export = ApiGateway;
