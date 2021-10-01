const { ServiceBroker } = require('moleculer')
const ApiGateway = require('moleculer-web')
const path = require('path')
const fs = require('fs')

const broker = new ServiceBroker()

broker.createService({
  name: 'www',
  mixins: [ApiGateway],

  settings: {
    port: 3003,
    path: '/',

    assets: {
      // Root folder of assets
      folder: path.join(__dirname, 'firebase'),
      // Options to `server-static` module
      options: {},
    },

    routes: [
      {
        path: '/',
        autoAliases: true,
        whitelist: ['www.*'],
      },
    ],
  },

  actions: {
    appJS: {
      rest: 'GET /app.js',
      handler(ctx) {
        console.log('>> app.js')
        ctx.meta.$responseType = 'text/plain'
        const stream = fs.createReadStream(path.resolve(__dirname, 'firebase', 'app.js'), 'utf8')
        setTimeout(() => {
          stream.read(1024)
        }, 100)

        return stream
      },
    },
  },
})

const url = 'http://localhost:3003'

broker
  .start()
  .then(() => console.log(`Open ${url} to login and claim the access token`))
  .then(() => {
    const start =
      process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open'
    require('child_process').exec(start + ' ' + url)
  })
// .then(() => broker.repl())
