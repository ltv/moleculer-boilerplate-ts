import fs from 'fs';
import path from 'path';
import { generateSchemaFromDb } from 'utils/graphql';

const schemas: string[] = ['public'];

const generateTo: string = path.resolve('./graphql/schema.graphql');
const generateToDev: string = path.resolve('./graphql/schema.dev.graphql');

generateSchemaFromDb(schemas)
  .then((schema) => {
    console.log(`🚀 Generated GraphQL Types from database to '${generateTo}'`);
    fs.writeFileSync(generateTo, schema);
  })
  .catch((e) => console.error(e));

generateSchemaFromDb(schemas, { Query: false, Mutation: false })
  .then((schema) => {
    console.log(`🚀 [DEV ONLY] Generated GraphQL Types from database to '${generateToDev}'`);
    fs.writeFileSync(generateToDev, schema);
  })
  .catch((e) => console.error(e));
