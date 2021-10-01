import { GenericObject, Service, ServiceSettingSchema } from 'moleculer'

export type MemoizeOptions = {
  ttl?: number
}

export class BaseService<S extends ServiceSettingSchema = ServiceSettingSchema> extends Service<S> {
  public config: GenericObject = {}

  // memoize (S)
  protected async memoize<T, P = any>(
    name: string,
    params: P,
    callback: () => Promise<T>,
    options?: MemoizeOptions,
  ): Promise<T> {
    if (!this.broker.cacher) return callback()

    const key = this.broker.cacher.defaultKeygen(`${name}:memoize-${name}`, params as any, {}, [])

    let res = await this.broker.cacher.get(key)
    if (res) return <T>res

    res = await callback()
    this.broker.cacher.set(key, res, options && options.ttl)

    return <T>res
  }
  // memoize (E)
}
