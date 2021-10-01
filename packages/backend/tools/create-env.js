const path = require('path')
const fs = require('fs')
const { createPrismaEnv } = require('./prisma-env')

const defaultEnvPath = path.resolve(__dirname, '..', 'default.env')
const localEnvPath = path.resolve(__dirname, '..', 'local.env')

const createEnv = async () => {
  if (fs.existsSync(localEnvPath)) {
    return
  }
  fs.copyFileSync(defaultEnvPath, localEnvPath)
  console.log('Copied environment from default.env to local.env')
}

const writeDbURL2LocalEnv = (dbUrl) => {
  const localEnvBody = fs.readFileSync(localEnvPath, 'utf8')
  if (localEnvBody.indexOf('DATABASE_URL') !== -1) {
    return
  }
  const dbInfo = `## PRISMA DATABASE_URL -> Generated from .env\n${dbUrl}\n`
  fs.writeFileSync(localEnvPath, `${dbInfo}\n${localEnvBody}`, { encoding: 'utf8' })
}

Promise.resolve()
  .then(createEnv)
  .then(createPrismaEnv)
  .then(writeDbURL2LocalEnv)
  .then(() => {
    console.log('Created prisma env at .env')
  })
