import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import { UserExamAttempt } from "./types";

import createClient, { FetchOptions, FetchResponse } from "openapi-fetch";
import type { paths } from "../../prisma/api-schema";

const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_FREECODECAMP_API,
  fetch,
});

export async function verifyToken(token: string) {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    if (token) {
      const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;
      const data = { expireAt: Date.now() + TWO_DAYS_IN_MS };
      const response = new Response(JSON.stringify(data));
      return { data, response };
    } else {
      const response = new Response(null, { status: 404 });
      // TODO: There must be a better way to get this
      const error: paths["/exam-environment/token-meta"]["get"]["responses"]["404"]["content"]["application/json"] =
        { code: "FCC_TEST_ERROR_CODE", message: "Non-existant token" };
      return { error, response };
    }
  }

  const res = await client.GET("/exam-environment/token-meta", {
    params: {
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  console.debug(res);

  return res;
}

export async function getGeneratedExam(examId: string) {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    const generatedExam = (await (
      await fetch("/mocks/generated-exam.json")
    ).json()) as paths["/exam-environment/exam/generated-exam"]["post"]["responses"]["200"]["content"]["application/json"];
    generatedExam.examAttempt.startTimeInMS = Date.now();

    const res = openapiFetchResponse<
      "/exam-environment/exam/generated-exam",
      "post",
      typeof generatedExam
    >(generatedExam);
    return res;
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await client.POST("/exam-environment/exam/generated-exam", {
    body: { examId },
    params: {
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  return res;
}

export async function postExamAttempt(examAttempt: UserExamAttempt) {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    return new Response();
  }

  const endpoint = new URL(
    "/exam-environment/exam/attempt",
    import.meta.env.VITE_FREECODECAMP_API
  );

  const token = await invoke<string>("get_authorization_token");
  const res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({
      attempt: examAttempt,
    }),
    headers: {
      "Exam-Environment-Authorization-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error(await res.json());
  } else {
    return res;
  }
}

export async function getExams() {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    const res = await fetch("/exam-config.json");
    const [exam] = await res.json();
    return [
      {
        id: exam.id,
        canTake: true,
        config: {
          name: exam.config.name,
          note: exam.config.note,
          totalTimeInMS: exam.config.totalTimeInMS,
        },
      },
    ];
  }

  const endpoint = new URL(
    "/exam-environment/exams",
    import.meta.env.VITE_FREECODECAMP_API
  );

  const token = await invoke<string>("get_authorization_token");
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Exam-Environment-Authorization-Token": token,
    },
  });

  if (res.status !== 200) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  console.debug(data);

  return data;
}

function openapiFetchResponse<
  Url extends keyof paths,
  Method extends keyof paths[Url] &
    ("get" | "post" | "put" | "delete" | "patch"),
  T extends paths[Url][Method] extends {
    responses: { "200": { content: { "application/json": any } } };
  }
    ? paths[Url][Method]["responses"]["200"]["content"]["application/json"]
    : never
>(data: T): FetchResponse<T, FetchOptions<T>, "application/json"> {
  return {
    data,
    response: new Response(null, { status: 200 }),
  };
}
