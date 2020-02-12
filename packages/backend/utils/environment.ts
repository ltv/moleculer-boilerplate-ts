const { NODE_ENV } = process.env;

export function isProd() {
  return NODE_ENV === 'production';
}

export function isTest() {
  return NODE_ENV === 'test';
}

export function isDev() {
  return NODE_ENV !== 'production' && NODE_ENV !== 'test';
}
