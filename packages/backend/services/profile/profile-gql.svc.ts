import { Profile } from '@prisma/client'
import omit from 'lodash/omit'
import { Event, Service } from 'moleculer-decorators'
import { GraphQLService } from 'shared/core/graphql.svc'
import { GraphQLMixin } from 'shared/mixins/graphql.mixin'

@Service({
  name: 'profile-gql',
  mixins: [
    GraphQLMixin({
      table: {
        name: 'Profile',
        primary: {
          id: 'Int',
        },
      },
    }),
  ],
})
export default class ProfileGQLService extends GraphQLService {
  @Event({
    name: 'auth.resolvedToken',
  })
  async createUser(profile: Profile): Promise<void> {
    const cacheId = `profile.${profile.userId}`
    this.logger.debug(`[resolvedToken] > ${profile.userId}`)
    const hasProfileInCached = await this.broker.cacher.get(cacheId).then((rtnPrf) => !!rtnPrf)
    if (hasProfileInCached) {
      return
    }
    const update = omit(profile, 'id', 'userId')
    const create = omit(profile, 'id')
    this.model
      .upsert({
        where: { userId: profile.userId },
        update,
        create,
      })
      .then((rtnPrf: Profile) => {
        this.broker.cacher?.set(cacheId, rtnPrf, 3600 * 24 * 30) // cache in 30days
        return rtnPrf
      })
  }
}
