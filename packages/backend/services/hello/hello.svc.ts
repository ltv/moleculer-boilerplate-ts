import { BaseService } from 'shared/core/base.svc'
import { Action, Service } from 'moleculer-decorators'
import { Context } from 'moleculer'

@Service({
  name: 'hello',
  mixins: [],
})
export default class HelloService extends BaseService {
  created(): void {
    //
  }

  @Action({
    name: 'hi',
    params: {
      name: 'string',
    },
  })
  sayHi(ctx: Context<{ name: string }>) {
    const { name } = ctx.params
    return `Hi ${name}`
  }
}
