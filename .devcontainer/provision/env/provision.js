const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const ENV_DIR = path.resolve(__dirname);
const PROJECT_DIR = process.argv[2];
if (!PROJECT_DIR) {
  throw new Error('Please provide project directory. Ex: node provision.js PKG_DIR');
}
const PKG_DIR = path.resolve(PROJECT_DIR, 'packages');
const allEnvFiles = fs.readdirSync(ENV_DIR).filter(f => f.endsWith('.env'));

// Create default environment for each package
function createEnv() {
  const { packages } = config;
  const pkgNames = Object.keys(packages);

  return Promise
    .all(pkgNames.map(pkgNm => getPkgEnv(pkgNm, packages[pkgNm])))
    .then(pkgEnvContents => Promise.all(pkgEnvContents.map(pkg => createPkgEnv(pkg, { envFile: '.env.development' }))))
}

function getPkgEnv(pkgNm, { includes, excludes }) {
  includes = includes || [];
  excludes = excludes || [];

  if (includes.indexOf('*') !== -1) {
    includes = [...allEnvFiles];
  }
  if (excludes.indexOf('*') !== -1) {
    return;
  }
  includes = includes.map(f => `${f}`.endsWith('.env') ? f : `${f}.env`);
  excludes = excludes.map(f => `${f}`.endsWith('.env') ? f : `${f}.env`);
  const envFiles = allEnvFiles.filter(f => includes.indexOf(f) !== -1 && excludes.indexOf(f) === -1);
  return Promise
    .all(envFiles.map(f => readFileAsync(path.resolve(ENV_DIR, f), { encoding: 'utf8' })))
    .then(envContents => ({ name: pkgNm, content: envContents.join('\n') }));
}

function createPkgEnv(pkg, options = { envFile: '.env.development' }) {
  const writeToDir = path.resolve(PKG_DIR, pkg.name);
  const writeTo = path.resolve(writeToDir, options.envFile);
  if (!fs.existsSync(writeToDir)) {
    return Promise.resolve({ package: pkg.name, writeTo, status: '404' });
  }
  return writeFileAsync(writeTo, pkg.content, { encoding: 'utf8' })
    .then(() => ({ package: pkg.name, writeTo, status: 'OK' }));
}


createEnv().then((results) => console.log(results));
