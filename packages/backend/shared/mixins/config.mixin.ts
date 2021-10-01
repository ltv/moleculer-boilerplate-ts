import { Config } from '@prisma/client'
import _ from 'lodash'
import { Context, GenericObject, Utils } from 'moleculer'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (keys: string[], opts?: GenericObject) {
  opts = _.defaultsDeep(opts, {
    propName: 'config',
    objPropName: 'configObj',
    configChanged: 'configChanged',
    serviceName: 'config',
    serviceVersion: 1,
  })

  return {
    dependencies: [{ name: opts.serviceName, version: opts.serviceVersion }],

    events: {
      async 'config.changed'(ctx: Context) {
        this.logger.info('Configuration changed. Updating...')
        const changes = Array.isArray(ctx.params) ? ctx.params : [ctx.params]
        changes.forEach((item: Config) => {
          if (keys.some((key) => Utils.match(item.key, key))) {
            this[opts.propName][item.key] = item.value
            _.set(this[opts.objPropName], item.key, item.value)
            this.logger.debug('Configuration updated:', this[opts.propName])

            if (_.isFunction(this[opts.configChanged])) {
              this[opts.configChanged].call(this, item.key, item.value, item)
            }
          }
        })
        this.logger.info('Configuration changed.', this[opts.propName])
      },
    },

    async started() {
      if (!_.isObject(this[opts.propName])) this[opts.propName] = {}
      if (!_.isObject(this[opts.objPropName])) this[opts.objPropName] = {}

      if (keys.length > 0) {
        const items = await this.broker.call('v1.config.get', { key: keys })
        if (items) {
          items.forEach((item: Config) => {
            this[opts.propName][item.key] = item.value
            _.set(this[opts.objPropName], item.key, item.value)
          })
        }
      }

      this.logger.debug('Configuration loaded:', this[opts.propName])
    },
  }
}
