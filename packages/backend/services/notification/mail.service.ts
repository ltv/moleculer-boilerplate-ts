import { BaseService, Context } from '@app/types';
import { Action, Service } from 'moleculer-decorators';
import { SVC_MAIL } from 'utils/constants';

@Service({
  name: SVC_MAIL
})
export default class MailService extends BaseService {
  @Action({
    name: 'send'
  })
  actSend(ctx: Context) {
    return ctx.params;
  }
}
