/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config, GlobalReject, Prisma } from '@prisma/client'
import flattenDeep from 'lodash/flattenDeep'
import isEqual from 'lodash/isEqual'
import uniqBy from 'lodash/uniqBy'
import { Context, Errors, Utils } from 'moleculer'
import { Action, Service } from 'moleculer-decorators'
import { PrismaService } from 'shared/core/prisma.svc'
import { PrismaMixin } from 'shared/mixins/prisma.mixin'

type ModelDelegate = Prisma.ConfigDelegate<GlobalReject>

const { ValidationError } = Errors

@Service({
  name: 'config',
  version: 1,
  mixins: [
    PrismaMixin({
      prisma: {
        model: 'Config',
      },
    }),
  ],
  settings: {
    defaultConfig: {
      'mail.enabled': 'false',
      'mail.from': 'no-reply@ltv.dev',
    },
  },
})
export default class ConfigService extends PrismaService<ModelDelegate> {
  // ACTIONS (S)
  /**
   * Get configurations by key or keys
   *
   * @actions
   * @param {String|Array<String>} key
   * @returns {Object|Array<String>}
   */

  @Action({
    name: 'get',
    cache: {
      keys: ['key'],
    },
  })
  actGet(ctx: Context<Config>): Promise<Config | Config[]> {
    if (ctx.params.key == null)
      throw new ValidationError("Param 'key' must be defined.", 'ERR_KEY_NOT_DEFINED')
    return this.get(ctx.params.key)
  }

  /**
   * Set configuration values by keys
   *
   * @actions
   * @param {String} key
   * @param {any} key
   * @returns {Object|Array<Object>}
   */
  @Action({
    name: 'set',
  })
  async actSet(ctx: Context<any>): Promise<Config | Config[]> {
    if (Array.isArray(ctx.params)) {
      return Promise.all(
        ctx.params.map(async (p: Config) => {
          const { changed, item } = await this.set(p.key, p.value)
          if (changed) ctx.broker.broadcast(`config.changed`, item)

          return item
        }),
      )
    } else {
      const { changed, item } = await this.set(ctx.params.key, ctx.params.value)
      if (changed) ctx.broker.broadcast(`config.changed`, item)

      return item
    }
  }

  @Action({ cache: true })
  all(): Promise<Config[]> {
    return this.model.findMany({})
  }
  // ACTIONS (E)

  // METHODS (S)
  /**
   * Get configurations by key.
   *
   * @methods
   * @param {String|Array<String>} key Config key
   * @returns {Object|Array<Object>}
   */
  async get(key: string | string[]): Promise<Config | Config[]> {
    if (Array.isArray(key)) {
      const res = await Promise.all(key.map((k) => this.getByMask(k)))
      return uniqBy(flattenDeep(res), (item) => item.key)
    }

    if (key.indexOf('*') == -1 && key.indexOf('?') == -1) {
      return this.model.findUnique({ where: { key } })
    }

    return this.getByMask(key)
  }

  /**
   * Get configurations by key mask.
   *
   * @methods
   * @param {String} mask Key mask
   * @returns {Array<Object>}
   */
  async getByMask(mask: string): Promise<Config[]> {
    const allItems: Config[] = await this.broker.call(`${this.fullName}.all`)

    /* istanbul ignore next */
    if (!allItems) return []

    return allItems.filter((item) => Utils.match(item.key, mask))
  }

  /**
   * Check whether a configuration key exists.
   *
   * @methods
   * @param {String} key
   * @returns {Boolean}
   */
  has(key: string): Promise<boolean> {
    return this.model.findUnique({ where: { key } }).then((res) => !!res)
  }

  /**
   * Set a configuration value.
   *
   * @methods
   * @param {String} key Key
   * @param {any} value Value
   * @param {Boolean} isDefault
   *
   * @returns {Object}
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async set(key: string, value: string, isDefault = false) {
    const item = await this.model.findUnique({ where: { key } })
    if (item != null) {
      if (!isEqual(item.value, value)) {
        // Modify
        return {
          item: await this.model.update({ where: { key }, data: { value: { set: value } } }),
          changed: true,
        }
      }

      // No changes
      return {
        item,
        changed: false,
      }
    }

    // Create new
    return {
      item: await this.model.create({ data: { key, value, isDefault } }),
      changed: true,
      new: true,
    }
  }

  /**
   * Run configuration migration. Add missing keys.
   *
   * @methods
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  migrateConfig() {
    return Promise.all(
      Object.keys(this.settings.defaultConfig).map(async (key) => {
        const value = this.settings.defaultConfig[key]
        const item = (await this.get(key)) as Config // in this case, alway return single record
        if (!item) {
          this.logger.info(`Save new config: "${key}" =`, value)
          return this.set(key, value, true)
        } else if (item.isDefault && !isEqual(item.value, value)) {
          this.logger.info(`Update default config: "${key}" =`, value)
          return this.set(key, value, true)
        }
      }),
    )
  }
  // METHODS (E)

  // HOOKS (S)
  public started(): void {
    this.migrateConfig().then(() => this.logger.info('Updated default configs'))
  }
  // HOOKS (E)
}
