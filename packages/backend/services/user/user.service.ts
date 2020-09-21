import { BaseService, Context } from '@app/types';
import { Service, Action } from 'moleculer-decorators';
import { SVC_USER } from 'utils/constants';
import { User } from '@prisma/client';

@Service({
  name: SVC_USER,
  mixins: [],
  settings: {}
})
export default class UserService extends BaseService {
  @Action({ name: 'create' })
  actCreate(ctx: Context<User>) {
    return ctx.params;
  }
}
