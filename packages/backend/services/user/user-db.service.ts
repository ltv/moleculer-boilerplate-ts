import { User, UserDelegate } from '@prisma/client';
import { PrismaService } from 'core';
import { PrismaMixin } from 'mixins/prisma.mixin';
import { Service, Action } from 'moleculer-decorators';
import { SVC_USER_DB } from 'utils/constants';
import { Context } from '@app/types';

@Service({
  name: SVC_USER_DB,
  mixins: [
    PrismaMixin<UserDelegate, User>({
      prisma: {
        model: prisma => prisma.user
      }
    })
  ],
  settings: {}
})
export default class UserDBService extends PrismaService<UserDelegate> {
  @Action({ name: 'createUserWithProfile' })
  actCreateUserWithProfile(ctx: Context<User>) {
    return this.model().create({
      data: {
        ...ctx.params,
        profile: {
          create: {
            firstName: ctx.params.name,
            lastName: ''
          }
        }
      }
    });
  }
}
