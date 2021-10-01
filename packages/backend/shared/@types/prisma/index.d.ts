import '@prisma/client'

declare module '@prisma/client' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type GlobalReject<T = any> = 'rejectOnNotFound' extends keyof T ? T['rejectOnNotFound'] : false
}
