import admin from 'firebase-admin'
import { Event } from 'moleculer-decorators'
import { AuthSpecialRole } from 'shared/core'
import { BaseService } from 'shared/core/base.svc'

export default class FirebaseService extends BaseService {
  created(): void {
    this.initFirebaseAdmin()
  }

  initFirebaseAdmin(): void {
    if (admin.app.length > 0) {
      return
    }
    admin.initializeApp()
  }

  @Event({
    name: 'auth.resolvedToken',
  })
  async setCustomUserClaims(profile: { userId: string, role: AuthSpecialRole }): Promise<void> {
    const cacheId = `profile.${profile.userId}`
    this.logger.debug(`[resolvedToken] > ${profile.userId}`)
    const hasProfileInCached = await this.broker.cacher.get(cacheId).then((rtnPrf) => !!rtnPrf)
    if (hasProfileInCached) {
      return
    }
    await admin
      .auth()
      .setCustomUserClaims(profile.userId, { role: profile.role.toLocaleLowerCase() })
  }
}
