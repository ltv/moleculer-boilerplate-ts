import { ServiceRouteOptions } from 'moleculer-apollo-server';

export const routes: ServiceRouteOptions[] = [
  {
    path: '/api/auth',
    aliases: {
      'POST login': 'auth.login'
    },
    bodyParsers: {
      json: true,
      urlencoded: { extended: true }
    }
  }
];
