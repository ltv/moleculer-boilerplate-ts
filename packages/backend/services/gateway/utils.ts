import * as ApiService from 'moleculer-web';
import pick from 'lodash.pick';

import { Context } from '@app/types';
import { ROLE_EVERYONE } from 'utils/constants';
import { AdmUsr } from '@app/models';

const { UnAuthorizedError, ERR_INVALID_TOKEN } = ApiService.Errors;
/**
 * Authenticate the request
 *
 * @param {Context} ctx
 * @param {Object} route
 * @param {IncomingRequest} req
 * @returns {Promise}
 */
export async function authenticate(ctx: Context, _: any, req: any) {
  let token;

  // Get JWT token from Authorization header
  if (!token) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  }

  ctx.meta.roles = [ROLE_EVERYONE];

  // FAKE TOKEN
  token = 'My NICE TOKEN';
  let user!: AdmUsr; // TODO: Use User Type definition

  if (token) {
    // user = await ctx.call('auth.resolveToken', { token });
    user = { usrId: 1, usrNm: 'lucduong', usrEml: 'luc@ltv.vn', orgId: 1 };
    if (user) {
      // user.roles = await ctx.call(`${SERVICE_USER}.getRolesByUserId`, {
      //   usrId: user.usrId
      // });
      user.roles = [];

      this.logger.info('User authenticated via JWT.', {
        username: user.usrNm,
        email: user.usrEml,
        id: user.usrId
      });

      // ctx.meta.roles.push(ROLE_AUTHENTICATED);
      // Reduce user fields (it will be transferred to other nodes)
      if (user.roles) {
        ctx.meta.roles.push(...user.roles.map((role: any) => role.roleCd));
      }
      // ctx.meta.user = pick(user, ['usrId', 'usrNm', 'usrEml']);
      // ctx.meta.token = token;
      // ctx.meta.usrId = user.usrId;

      // Support organization_id
      user.orgId = 1;
      ctx.meta.user = pick(user, ['usrId', 'usrNm', 'usrEml', 'orgId']);
      ctx.meta.token = token;
      ctx.meta.usrId = user.usrId;
      ctx.meta.orgId = user.orgId;

      return ctx.meta.user;
    }
    return undefined;
  }
  return Promise.reject(new UnAuthorizedError(ERR_INVALID_TOKEN, { token }));
}
