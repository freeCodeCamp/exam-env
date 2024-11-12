import { writeFile } from "fs/promises";

const GITHUB_PRISMA_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/api/prisma/schema.prisma";

async function get_prisma_schema() {
  try {
    const data = await fetch(GITHUB_PRISMA_URL);
    const schema = await data.text();
    return schema;
  } catch (e) {
    return e;
  }
}

async function main() {
  let schema = await get_prisma_schema();

  if (schema instanceof Error) {
    console.error(schema);
    return;
  }

  const generator = `
generator jsonSchema {
  provider = "prisma-json-schema-generator"
  output   = "../prisma"
  includeRequiredFields = "true"
  persistOriginalType = "true"
  keepRelationFields = "false"
}
`;

  schema += generator;

  await writeFile("./prisma/schema.prisma", schema);
}

await main();
