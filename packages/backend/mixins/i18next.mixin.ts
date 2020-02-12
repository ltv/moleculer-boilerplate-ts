import path from 'path';
import i18next from 'i18next';
import i18nextFs from 'i18next-node-fs-backend';
import defaultsDeep from 'lodash.defaultsdeep';

// Credits: Copied from https://github.com/i18next/i18next-express-middleware/blob/master/src/utils.js
function setPath(object: any, path: any, newValue: any) {
  let stack;
  if (typeof path !== 'string') stack = [].concat(path);
  if (typeof path === 'string') stack = path.split('.');

  while (stack.length > 1) {
    let key = stack.shift();
    if (key.indexOf('###') > -1) key = key.replace(/###/g, '.');
    if (!object[key]) object[key] = {};
    object = object[key];
  }

  let key = stack.shift();
  if (key.indexOf('###') > -1) key = key.replace(/###/g, '.');
  object[key] = newValue;
}

export interface I18NextMixinOptions {
  folder: string;
  routePath: string;
}

export function I18NextMixin(mixinOptions?: I18NextMixinOptions) {
  mixinOptions = defaultsDeep(mixinOptions, {
    folder: './locales',
    routePath: '/locales'
  });

  i18next
    .use(i18nextFs)
    .init({
      // debug: true,
      fallbackLng: 'en',
      whitelist: ['en', 'vi'],
      ns: ['common', 'errors'],
      defaultNS: 'common',
      load: 'all',
      saveMissing: true, // config.isDevMode(),
      saveMissingTo: 'all', // "fallback", "current", "all"

      backend: {
        // path where resources get loaded from
        loadPath: path.join(mixinOptions.folder, '{{lng}}', '{{ns}}.json'),

        // path to post missing resources
        addPath: path.join(
          mixinOptions.folder,
          '{{lng}}',
          '{{ns}}.missing.json'
        ),

        // jsonIndent to use when storing json files
        jsonIndent: 4
      }
    })
    .catch(err => console.warn(err));

  return {
    name: '',
    created() {
      const route = {
        path: mixinOptions.routePath,

        aliases: {
          // multiload backend route
          'GET /': (req: any, res: any) => {
            const resources: any = {};

            const languages = req.query['lng']
              ? req.query['lng'].split(' ')
              : [];
            const namespaces = req.query['ns']
              ? req.query['ns'].split(' ')
              : [];

            // extend ns
            namespaces.forEach((ns: string) => {
              if (i18next.options.ns && i18next.options.ns.indexOf(ns) < 0)
                (<Array<string>>i18next.options.ns).push(ns);
            });

            i18next.services.backendConnector.load(
              languages,
              namespaces,
              function() {
                languages.forEach((lng: string) =>
                  namespaces.forEach((ns: string) =>
                    setPath(
                      resources,
                      [lng, ns],
                      i18next.getResourceBundle(lng, ns)
                    )
                  )
                );

                res.setHeader(
                  'Content-Type',
                  'application/json; charset=utf-8'
                );
                res.end(JSON.stringify(resources));
              }
            );
          },

          // missing keys
          'POST /': (req: any, res: any) => {
            const lng: string = req.query['lng'];
            const ns: string = req.query['ns'];

            for (const m in req.body) {
              if (m != '_t')
                i18next.services.backendConnector.saveMissing(
                  [lng],
                  ns,
                  m,
                  req.body[m]
                );
            }
            res.end('ok');
          }
        },

        mappingPolicy: 'restrict',

        bodyParsers: {
          urlencoded: { extended: true }
        }
      };

      // Add route.
      this.settings.routes.unshift(route);
    }
  };
}
