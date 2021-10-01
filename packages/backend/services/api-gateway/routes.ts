/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientRequest } from 'http'
import { Context } from 'moleculer'

export const routes: any[] = [
  {
    path: '/api/v1',
    etag: true,
    camelCaseNames: true,
    authentication: false,
    autoAliases: false,
    aliases: {
      // 'GET /auth/me': `users.me`,
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    onBeforeCall(
      ctx: Context<any, AppMeta>,
      _: any,
      req: ClientRequest & { headers: { [key: string]: string } },
    ) {
      this.logger.info('onBeforeCall in protected route')
      ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress

      this.logger.info('Request from client: ', ctx.meta.clientIp)
    },
  },
]
export default {}
