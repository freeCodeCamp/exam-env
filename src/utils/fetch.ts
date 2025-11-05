import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import createClient from "openapi-fetch";

import type { paths } from "../../prisma/api-schema";
import { UserExam, UserExamAttempt } from "./types";
import { VITE_MOCK_DATA } from "./env";
import { deserializeDates } from "./serde";
import { captureException } from "@sentry/react";

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
      return data;
    } else {
      // TODO: There must be a better way to get this
      const error: paths["/exam-environment/token-meta"]["get"]["responses"]["404"]["content"]["application/json"] =
        { code: "FCC_TEST_ERROR_CODE", message: "Non-existant token" };
      return error;
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

  if (res.error) {
    captureException(res.error);
    throw res.error;
  }

  return res.data;
}

export async function getGeneratedExam(examId: string) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
    const generatedExam = (await (
      await fetch("/mocks/generated-exam.json")
    ).json()) as { exam: UserExam; examAttempt: UserExamAttempt };
    generatedExam.examAttempt.startTime = new Date();

    // throw {
    //     code: "FCC_EXAM_ERROR",
    //     message: "Example error fetching generated exam.",
    //   };
    return generatedExam;
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

  if (res.error) {
    captureException(res.error);
    throw res.error;
  }

  return deserializeDates<{ exam: UserExam; examAttempt: UserExamAttempt }>(
    res.data
  );
}

export async function postExamAttempt(examAttempt: UserExamAttempt) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
    // const error = {
    //   code: "EXAMPLE_ERROR",
    //   message: "Example error when posting exam",
    // };
    // throw error;
    return undefined as never;
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

  if (res.error) {
    captureException(res.error);
    throw res.error;
  }

  return res;
}

export async function getExams() {
  if (VITE_MOCK_DATA) {
    await delayForTesting(1000);
    const res = await fetch("/mocks/exams.json");
    const [exam] =
      (await res.json()) as paths["/exam-environment/exams"]["get"]["responses"]["200"]["content"]["application/json"];
    return [
      {
        id: exam.id,
        canTake: true,
        config: {
          name: exam.config.name,
          note: exam.config.note,
          totalTimeInS: exam.config.totalTimeInS,
          retakeTimeInS: exam.config.retakeTimeInS,
        },
      },
    ];
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await client.GET("/exam-environment/exams", {
    params: {
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  if (res.error) {
    captureException(res.error);
    throw res.error;
  }

  return res.data;
}

export async function getAttemptsByExamId(examId: string) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await client.GET(`/exam-environment/exams/{examId}/attempts`, {
    params: {
      path: { examId },
      header: {
        "exam-environment-authorization-token": token,
      },
    },
  });

  if (res.error || res.response.status >= 300) {
    captureException(res.error);
    throw res.error;
  }

  return res.data;
}

export async function delayForTesting(t: number) {
  await new Promise((res, _) => setTimeout(res, t));
}
