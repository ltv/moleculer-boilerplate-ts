import { Event, Service } from 'moleculer-decorators'
import { BaseService } from 'shared/core/base.svc'

@Service({
  name: 'mail',
})
export default class MailService extends BaseService {
  send() {
    console.log('>> send: ')
  }

  @Event({
    name: 'auth.passwordChanged',
  })
  sendPasswordChangedEmail() {
    console.log('[sendPasswordChangedEmail]')
    this.send()
  }
}
