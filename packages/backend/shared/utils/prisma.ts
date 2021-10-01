import { Prisma, PrismaClient } from '.prisma/client'
import { LoggerInstance } from 'moleculer'

export const customPrismaLog = (prisma: PrismaClient, logger: LoggerInstance) => {
  prisma.$on <
    any >
    ('query',
    (e: Prisma.QueryEvent) => {
      logger.info(
        '\n\x1b[36m -> Query: \x1b[0m',
        `\x1b[35m ${e.query} \x1b[0m`,
        '\n\x1b[36m -> Params: \x1b[0m',
        `\x1b[35m ${e.params} \x1b[0m`,
        '\n\x1b[36m -> Duration: \x1b[0m',
        `\x1b[35m ${e.duration} \x1b[0m`,
      )
    })
  // prisma.$on<any>('info', (e: Prisma.LogEvent) => {
  //   logger.info(e.message)
  // })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma.$on <
    any >
    ('error',
    (e: Prisma.LogEvent) => {
      logger.error(e.message)
    })
  return prisma
}
