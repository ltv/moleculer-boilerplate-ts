const path = require('path')
const fs = require('fs')
const esbuild = require('esbuild')
const uniq = require('lodash/uniq')
const merge = require('lodash/merge')
const outDir = path.resolve('dist')
const pkg = require('./package.json')

const [, , svcName] = process.argv

function walkSync(dir, fileList = []) {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file)
    try {
      fileList = walkSync(dirFile, fileList)
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBUSY') fileList = [...fileList, dirFile]
      else throw err
    }
  })
  return fileList
}

function getEntries({ config }) {
  const svcFilter = (file) =>
    svcName
      ? file.startsWith(`services/${svcName}`) && file.match(/.*\.svc\.ts$/)
      : file.match(/.*\.svc\.ts$/)
  return walkSync('./services')
    .filter(svcFilter)
    .map((file) => {
      const [, svc, filename] = file.substring(0, file.length - 3).split('/')
      return {
        name: `${svc}/services/${filename}`,
        path: `./${file}`,
        cfg: `${svc}/${config.key}`,
        gql: `${svc}/tools/generate-graphql`,
      }
    })
    .reduce(
      (memo, { name, path, cfg, gql }) => ({
        ...memo,
        [name]: path,
        [cfg]: config.path,
        [gql]: 'tools/generate-graphql.ts',
      }),
      {},
    )
}

const copyFileAsync = (from, to) =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(path.resolve(outDir, path.dirname(to)), { recursive: true })
    fs.copyFile(path.resolve(from), path.resolve(outDir, to), (err) => {
      if (!err) {
        return reject(err)
      }
      return resolve(true)
    })
  })

const writeFileSync = (to, data) =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      path.resolve(outDir, to),
      JSON.stringify(data, null, 2),
      { encoding: 'utf8' },
      (err) => {
        if (!err) {
          return reject(err)
        }
        return resolve(true)
      },
    ),
  )

const filter = (x) => ['.bin', '@svc'].indexOf(x) === -1

let nodeModules = fs.readdirSync('node_modules').filter(filter)
if (fs.existsSync('../../node_modules')) {
  nodeModules = nodeModules.concat(fs.readdirSync('../../node_modules').filter(filter))
}

console.time('Build Production')
;(async () => {
  const buildOptions = {
    color: true,
    minify: false,
    bundle: true,
    sourcemap: false,
    platform: 'node',
    tsconfig: './tsconfig.json',
    logLevel: 'error',
    external: nodeModules,
  }

  try {
    const entries = getEntries({
      config: { key: 'moleculer.config', path: 'shared/configs/moleculer.config.ts' },
    })
    const names = Object.keys(entries)
    const entriesBuild = names.map((fileName) =>
      esbuild.build({
        entryPoints: [entries[fileName]],
        outfile: `${outDir}/${fileName}.js`,
        ...buildOptions,
      }),
    )
    const uniqServices = uniq(names.map((f) => f.split('/')[0]))
    await Promise.all(entriesBuild)
    await Promise.all([
      ...uniqServices.map((svc) => {
        const svcPkg = require(`./services/${svc}/package.json`)
        svcPkg.dependencies = merge(svcPkg.dependencies, pkg.dependencies)
        svcPkg.scripts = {
          prestart: 'node tools/generate-graphql.js && npx prisma generate',
          start: 'moleculer-runner --repl --mask *.svc.js --config moleculer.config.js services',
        }
        return writeFileSync(`${svc}/package.json`, svcPkg)
      }),
      ...uniqServices.map((svc) =>
        copyFileAsync('shared/prisma/schema.prisma', `${svc}/prisma/schema.prisma`),
      ),
    ])
  } catch (e) {
    console.error(e)
  }
})()

console.timeEnd('Build Production')
