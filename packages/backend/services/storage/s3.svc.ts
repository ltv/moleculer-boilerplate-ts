import { Context } from 'moleculer'
import { Action, Service } from 'moleculer-decorators'
import { AuthSpecialRole } from 'shared/core'
import { BaseService } from 'shared/core/base.svc'

@Service({
  name: 's3',
  mixins: [],
})
export default class S3Service extends BaseService {
  @Action({
    permissions: [AuthSpecialRole.AUTHENTICATED],
  })
  getPresignedUrl(ctx: Context) {
    return ctx.params
  }
}
