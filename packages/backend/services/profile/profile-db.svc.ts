import { Prisma } from '.prisma/client'
import { GlobalReject } from '@prisma/client'
import { Context } from 'moleculer'
import { Action, Service } from 'moleculer-decorators'
import { PrismaService } from 'shared/core/prisma.svc'
import { PrismaMixin } from 'shared/mixins/prisma.mixin'

type ModelDelegate = Prisma.ProfileDelegate<GlobalReject>

@Service({
  name: 'profile-db',
  mixins: [
    PrismaMixin({
      prisma: { model: 'Profile' },
      graphql: true,
    }),
  ],
})
export default class ProfileDbService extends PrismaService<ModelDelegate> {
  @Action({
    name: 'changePassword',
  })
  changePassword(ctx: Context) {
    ctx.emit('auth.passwordChanged', ':)')
  }
}
