import { ServiceEvents, ServiceSchema, ServiceSettingSchema } from 'moleculer';

export function CacheCleaner(
  eventNames: string[]
): ServiceSchema<ServiceSettingSchema> {
  const events: ServiceEvents = {};

  eventNames.forEach(name => {
    events[name] = function() {
      if (this.broker.cacher) {
        this.logger.debug(`Clear local '${this.name}' cache`);
        this.broker.cacher.clean(`${this.name}.*`);
      }
    };
  });

  const schema: ServiceSchema<ServiceSettingSchema> = {
    name: '',
    methods: {
      forceCleanCache(keys: string[] | string) {
        keys = keys instanceof Array ? keys : [keys];
        keys.forEach(k => {
          if (this.broker.cacher) {
            this.logger.debug(`Clear local '${k}' cache`);
            this.broker.cacher.clean(`${k}.*`);
          }
        });
      },
      delCache(keys: string[] | string) {
        keys = keys instanceof Array ? keys : [keys];
        keys.forEach(k => {
          if (this.broker.cacher) {
            this.logger.debug(`Clear local '${k}' cache`);
            this.broker.cacher.del(`${this.name}.${k}`);
          }
        });
      }
    }
    // events,
  };

  return schema;
}
