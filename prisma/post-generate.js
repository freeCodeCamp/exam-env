import { writeFile } from "fs/promises";
import openapiTS, { astToString } from "openapi-typescript";
import jsonSchema from "./json-schema.json" with { type: "json" };

/**
 * prisma-json-schema-generator has a bug with required types for non-scalar values
 * - https://github.com/valentinpalkovic/prisma-json-schema-generator/issues/1511
 */
async function main() {
  jsonSchema.definitions.EnvExam.required.push("config", "questionSets");
  jsonSchema.definitions.EnvConfig.required.push("tags", "questionSets");
  jsonSchema.definitions.EnvMultipleChoiceQuestion.required.push(
    "audio",
    "answers"
  );
  jsonSchema.definitions.EnvQuestionSet.required.push("context", "questions");
  jsonSchema.definitions.EnvExamAttempt.required.push("questionSets");
  jsonSchema.definitions.EnvMultipleChoiceQuestionAttempt.required.splice(
    jsonSchema.definitions.EnvMultipleChoiceQuestionAttempt.required.indexOf(
      "submissionTimeInMS"
    ),
    1
  );

  await writeFile(
    "./prisma/json-schema.json",
    JSON.stringify(jsonSchema, null, 2)
  );

  await openApi();
}

async function openApi() {
  const url = "https://test-api.freecodecamp.dev/documentation/json";

  const ast = await openapiTS(new URL(url));
  const contents = astToString(ast);

  // (optional) write to file
  await writeFile("./prisma/api-schema.ts", contents);
}

await main();
