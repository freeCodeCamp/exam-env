import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import createClient from "openapi-fetch";

import type { paths } from "../../prisma/api-schema";
import { UserExam, UserExamAttempt } from "./types";
import { VITE_MOCK_DATA } from "./env";

const fetch = (r: URL | Request | string) =>
  tauriFetch(r, { connectTimeout: 5_000 });

const client = createClient<paths>({
  baseUrl: __FREECODECAMP_API__,
  fetch,
});

export async function verifyToken(token: string) {
  if (VITE_MOCK_DATA) {
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
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
    const generatedExam = (await (
      await fetch("/mocks/generated-exam.json")
    ).json()) as { exam: UserExam; examAttempt: UserExamAttempt };
    generatedExam.examAttempt.startTimeInMS = Date.now();

    // return {
    //   response: new Response(null, { status: 500 }),
    //   error: {
    //     code: "FCC_EXAM_ERROR",
    //     message: "Example error fetching generated exam.",
    //   },
    // };
    return {
      data: generatedExam,
      response: new Response(null, { status: 200 }),
      error: undefined,
    };
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

  return res as {
    data?: { exam: UserExam; examAttempt: UserExamAttempt };
    response: typeof res.response;
    error: typeof res.error;
  };
}

export async function postExamAttempt(examAttempt: UserExamAttempt) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
    const response = new Response(null, { status: 200 });
    // const error = {
    //   code: "EXAMPLE_ERROR",
    //   message: "Example error when posting exam",
    // };
    // return { response, data: undefined as never, error };
    return { response, data: undefined as never, error: undefined };
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await client.POST("/exam-environment/exam/attempt", {
    body: { attempt: examAttempt },
    params: {
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  return res;
}

export async function getExams() {
  if (VITE_MOCK_DATA) {
    await delayForTesting(1000);
    const res = await fetch("/mocks/exams.json");
    const [exam] =
      (await res.json()) as paths["/exam-environment/exams"]["get"]["responses"]["200"]["content"]["application/json"];
    return {
      data: [
        {
          id: exam.id,
          canTake: true,
          config: {
            name: exam.config.name,
            note: exam.config.note,
            totalTimeInMS: exam.config.totalTimeInMS,
          },
        },
      ],
      response: new Response(null, { status: 200 }),
      error: undefined,
    };
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await client.GET("/exam-environment/exams", {
    params: {
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  return res;
}

export async function delayForTesting(t: number) {
  await new Promise((res, _) => setTimeout(res, t));
}
