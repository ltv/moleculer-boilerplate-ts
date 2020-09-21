import { Context } from '@ltv/moleculer-core';
import { ClientRequest } from 'http';

export const routes: any[] = [
  {
    path: '/api/v1',
    etag: true,
    camelCaseNames: true,
    authentication: false,
    autoAliases: false,
    aliases: {
      'GET /mail/send': 'mail.send',

      // projects
      'GET /projects/list': 'project.list',
      'GET /projects/findById': 'project.get',
      'POST /projects/create': 'project.create',
      'PUT /projects/update': 'project.update',
      'DELETE /projects/remove': 'project.remove',
      'PUT /projects/archived': 'project.archived'
    },
    onBeforeCall(
      ctx: Context,
      _: any,
      req: ClientRequest & { headers: { [key: string]: string } }
    ) {
      this.logger.info('onBeforeCall in protected route');
      ctx.meta.clientIp =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress;

      this.logger.info('Request from client: ', ctx.meta.clientIp);
    }
  }
];
