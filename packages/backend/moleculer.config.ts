import os from 'os';
import { BrokerOptions, Errors, TracerOptions, LoggerConfig } from 'moleculer';
import { CreateHealthCheckMiddleware } from './middlewares';
import { ActionOptions } from '@ltv/moleculer-decorators';

const nodeIDPrefix = process.env.NODE_ID || '';
const osHostName = os.hostname().toLowerCase();

// HeathCheck (S)
const {
  HEALTH_CHECK_READINESS_PATH,
  HEALTH_CHECK_LIVENESS_PATH,
  HEALTH_CHECK_PORT
} = process.env;
const healthCheckOpts = {
  port: +HEALTH_CHECK_PORT || 3001,
  readiness: {
    path: HEALTH_CHECK_READINESS_PATH || '/ready'
  },
  liveness: {
    path: HEALTH_CHECK_LIVENESS_PATH || '/live'
  }
};
// HeathCheck (E)

// Transporter (S)
const { TRANSPORTER_URL, NATS_USER, NATS_PASSWORD } = process.env;
const transporterOpts = {
  type: 'NATS',
  options: {
    url: TRANSPORTER_URL,
    user: NATS_USER,
    pass: NATS_PASSWORD
  }
};
const transporter = NATS_USER ? transporterOpts : TRANSPORTER_URL;
// Transporter (E)

// Redis (S)
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_CLUSTER } = process.env;
const redis = {
  host: REDIS_HOST,
  port: +REDIS_PORT,
  password: REDIS_PASSWORD
};
const hosts = REDIS_CLUSTER ? REDIS_CLUSTER.split(',') : [];
const cluster: any = {
  nodes: hosts.map((h: any) => {
    const [host, port] = h.split(':');
    return { host, port };
  }),
  options: {
    password: REDIS_PASSWORD
  }
};
// Redis (E)

// Cacher (S)
const cacher: any = {
  type: 'Redis',
  options: {
    // Prefix for keys
    prefix: 'MBT',
    // set Time-to-live to 30sec.
    ttl: 30
  }
};
if (hosts.length) {
  cacher.options.cluster = cluster;
} else {
  cacher.options.redis = redis;
}
// Cacher (E)

// Metrics (S)
const { METRIC_PORT, METRIC_PATH } = process.env;
const metrics = {
  enabled: true,
  reporter: [
    {
      type: 'Prometheus',
      options: {
        // HTTP port
        port: +METRIC_PORT || 3030,
        // HTTP URL path
        path: METRIC_PATH || '/metrics',
        // Default labels which are appended to all metrics labels
        defaultLabels: (registry: any) => ({
          namespace: registry.broker.namespace,
          nodeID: registry.broker.nodeID
        })
      }
    }
  ]
};
// Metrics (E)

// Tracing (S)
const { TRACING_TYPE, TRACING_SERVER } = process.env;
const tracingOpts =
  TRACING_TYPE === 'Zipkin'
    ? {
        // Base URL for Zipkin server.
        baseURL: TRACING_SERVER,
        // Sending time interval in seconds.
        interval: 5,
        // Additional payload options.
        payloadOptions: {
          // Set `debug` property in payload.
          debug: false,
          // Set `shared` property in payload.
          shared: false
        },
        // Default tags. They will be added into all span tags.
        defaultTags: null
      }
    : {};
const tracing: TracerOptions = TRACING_TYPE
  ? {
      enabled: true,
      exporter: {
        // type: 'Console',
        type: TRACING_TYPE || 'console',
        options: tracingOpts
      },
      stackTrace: true
    }
  : undefined;
// Tracing (E)

// LOGGER (S)
const { LOGGER_TYPE, LOGGER_LEVEL } = process.env;
const logger: LoggerConfig = {
  type: LOGGER_TYPE || 'Console',
  options: {
    level: LOGGER_LEVEL || 'info'
  }
};
// LOGGER (E)

const brokerConfig: BrokerOptions = {
  namespace: '',
  nodeID: `${nodeIDPrefix}-${osHostName}`,

  logFormatter: 'full',
  logger,

  transporter,

  cacher,

  serializer: 'JSON',

  requestTimeout: 900 * 1000,
  retryPolicy: {
    enabled: false,
    retries: 5,
    delay: 100,
    maxDelay: 1000,
    factor: 2,
    check: (err: Errors.MoleculerRetryableError) => err && !!err.retryable
  },

  maxCallLevel: 100,
  heartbeatInterval: 5,
  heartbeatTimeout: 15,

  tracking: {
    enabled: false,
    shutdownTimeout: 5000
  },

  disableBalancer: false,

  registry: {
    strategy: 'RoundRobin',
    preferLocal: true
  },

  circuitBreaker: {
    enabled: false,
    threshold: 0.5,
    windowTime: 60,
    minRequestCount: 20,
    halfOpenTime: 10 * 1000,
    check: (err: Errors.MoleculerRetryableError) => err && err.code >= 500
  },

  bulkhead: {
    enabled: false,
    concurrency: 10,
    maxQueueSize: 100
  },

  validator: true,

  metrics,

  tracing,

  // Register custom middlewares
  middlewares: [CreateHealthCheckMiddleware(healthCheckOpts)],

  replCommands: null
};

export = brokerConfig;
