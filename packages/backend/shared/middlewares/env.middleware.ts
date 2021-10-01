/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from 'moleculer'
import env from '@ltv/env'

export default {
  name: 'EnvMiddleware',

  localAction(next: (ctx: Context) => Promise<any>) {
    return function (ctx: Context) {
      ctx.env = env
      return next(ctx)
    }
  },
} as any
