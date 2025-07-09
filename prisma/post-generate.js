import { writeFile } from "fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

async function main() {
  await openApi();
}

async function openApi() {
  // Link to locally running instance of `freeCodeCamp/freeCodeCamp/api`
  const url = "http://127.0.0.1:3000/documentation/json";

  try {
    const ast = await openapiTS(new URL(url));
    const contents = astToString(ast);

    // (optional) write to file
    await writeFile("./prisma/api-schema.ts", contents);
  } catch (e) {
    console.error("Unable to get openapi spec for freeCodeCamp API");
    throw e;
  }
}

await main();
