const loader = require('graphql-tag/loader');
const pirates = require('pirates');

module.exports = register;
module.exports.default = register;

const mock = { cacheable() {} };

function register(options) {
  return pirates.addHook(hook, {
    exts: ['.graphql', '.graphqls', '.gql'],
    matcher: matcher,
    ignoreNodeModules: !(options && options.ignoreNodeModules === false)
  });

  function hook(code) {
    return loader.call(mock, code);
  }

  function matcher(filename) {
    return /\.graphqls?$/.test(filename);
  }
}

register();
