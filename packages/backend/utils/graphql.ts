import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import { createPostGraphileSchema, Plugin } from 'postgraphile';

import { printSchema } from 'graphql/utilities';
import { createPGPoolInstance } from 'utils/db';
import { ActionParams } from 'moleculer';

interface TypeTracer {
  [key: string]: boolean;
}

async function generateGraphQLFromDbSchema(schemaName: string, typeTracer: TypeTracer) {
  const options = { commentDescriptions: true };
  const schema = await createPostGraphileSchema(createPGPoolInstance(), schemaName, {
    appendPlugins: [ConnectionFilterPlugin as Plugin],
    graphileBuildOptions: { connectionFilterAllowEmptyObjectInput: true }
  });
  const typeMaps: any = (schema as any)._typeMap;
  const typeKeys: string[] = Object.keys(typeMaps).filter((t) => !t.startsWith('_'));

  typeKeys.forEach((type) => {
    if (typeTracer[type] || type.indexOf('Migration') !== -1) {
      delete (schema as any)._typeMap[type];
    }
    typeTracer[type] = true;
  });

  // remove unused types
  Object.keys(typeMaps)
    .filter((t) => t.startsWith('_'))
    .forEach((t) => delete (schema as any)._typeMap[t]);

  return printSchema(schema as any, options);
}

export async function generateSchemaFromDb(schemas: string[], typeTracer?: TypeTracer) {
  typeTracer = {
    Query: true,
    Mutation: true,
    String: true,
    Boolean: true,
    ...(typeTracer || {})
  };
  const generated: string[] = await Promise.all(
    schemas.map((dbSchema) => generateGraphQLFromDbSchema(dbSchema, typeTracer))
  );

  return generated.join('\n');
}

export function createGraphQLInputParams(
  props: ActionParams,
  options?: { optional?: boolean; key?: string }
): ActionParams {
  options = options || { optional: false };

  const { optional, key } = options;
  props = !!key ? { props: { key: { type: 'object', props } } } : props;
  return {
    input: {
      type: 'object',
      optional,
      props
    }
  };
}
