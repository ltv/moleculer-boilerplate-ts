import 'moleculer'
declare module 'moleculer' {
  // interface ActionSchema {
  //   permissions?: string[]
  // }

  type EnvFunc = <T = unknown>(key: string, defaultValue?: T) => T
  type Utils = {
    string: (key: string, defaultValue?: string) => string | undefined
    int: (key: string, defaultValue?: number) => number | undefined
    float: (key: string, defaultValue?: number) => number | undefined
    bool: (key: string, defaultValue?: boolean) => boolean | undefined
    json: <T = unknown>(key: string, defaultValue?: T) => T | undefined
    array: (key: string, defaultValue?: string[]) => string[] | undefined
    date: (key: string, defaultValue?: Date) => Date | undefined
  }

  interface Context {
    env: EnvFunc & Utils
  }
}
