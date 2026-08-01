import { invoke } from "@tauri-apps/api/core";
import createClient, { FetchResponse } from "openapi-fetch";
import { logger, startSpan } from "@sentry/react";

import type { paths } from "../../prisma/api-schema";
import { UserExam, UserExamAttempt } from "./types";
import { VITE_MOCK_DATA } from "./env";
import { deserializeDates } from "./serde";
import { isInformative } from "./errors";
import { ApiError, ENDPOINTS } from "./api-error";
import { captureApiResponseError } from "./sentry";
import { logUsage } from "./telemetry";
import { httpFetch } from "./http";

const fetch = (r: URL | Request | string) =>
  httpFetch(r, { connectTimeout: 5_000 });

const client = createClient<paths>({
  baseUrl: __FREECODECAMP_API__,
  fetch,
});

export async function verifyToken(token: string) {
  if (VITE_MOCK_DATA) {
    if (token) {
      const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;
      const data = { expireAt: String(Date.now() + TWO_DAYS_IN_MS) };
      return data;
    } else {
      // TODO: There must be a better way to get this
      const error: paths["/exam-environment/token-meta"]["get"]["responses"]["404"]["content"]["application/json"] =
        { code: "FCC_TEST_ERROR_CODE", message: "Non-existant token" };
      throw error;
    }
  }

  console.debug("in verify");
  const res = await startSpan(
    { name: ENDPOINTS.tokenMeta, op: "http.client" },
    async (span) => {
      const r = await client.GET("/exam-environment/token-meta", {
        params: {
          header: {
            "exam-environment-authorization-token": token,
          },
        },
      });
      span.setAttribute("http.response.status_code", r.response.status);
      return r;
    },
  );
  console.debug("done");

  debugResponse(res);

  if (res.error) {
    // Do not capture client errors (e.g. bad, missing, or malformed tokens)
    if (
      res.response.status !== 400 &&
      res.response.status !== 404 &&
      res.response.status !== 418
    ) {
      captureApiResponseError(res);
    }
    throw new ApiError(
      errorMessage(res),
      res.response.status,
      ENDPOINTS.tokenMeta,
      res.error.code,
    );
  }

  if (res.response.status >= 400) {
    throw new ApiError(
      errorMessage(res),
      res.response.status,
      ENDPOINTS.tokenMeta,
    );
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
    return { ...generatedExam, serverDate: undefined };
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: ENDPOINTS.generatedExam, op: "http.client" },
    async (span) => {
      const r = await client.POST("/exam-environment/exam/generated-exam", {
        body: { examId },
        params: {
          header: {
            "exam-environment-authorization-token": token,
          },
        },
      });
      span.setAttribute("http.response.status_code", r.response.status);
      return r;
    },
  );

  debugResponse(res);

  if (res.error) {
    if (res.error.code === "FCC_EINVAL_EXAM_ENVIRONMENT_PREREQUISITES") {
      logger.warn(res.error.message, res.error);
    } else {
      captureApiResponseError(res);
    }
    throw new ApiError(
      errorMessage(res),
      res.response.status,
      ENDPOINTS.generatedExam,
      res.error.code,
    );
  }

  const serverDateHeader = res.response.headers.get("Date");
  const serverDate = serverDateHeader ? new Date(serverDateHeader) : undefined;

  return {
    ...deserializeDates<{ exam: UserExam; examAttempt: UserExamAttempt }>(
      res.data,
    ),
    serverDate,
  };
}

export async function postExamAttempt(examAttempt: UserExamAttempt) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
    const error = {
      code: "EXAMPLE_ERROR",
      message: "Example error when posting exam",
    };
    throw new ApiError(error.message, 500, ENDPOINTS.examAttempt, error.code);
    // throw new Error(error.message);
    // return undefined as never;
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: ENDPOINTS.examAttempt, op: "http.client" },
    async (span) => {
      const r = await client.POST("/exam-environment/exam/attempt", {
        body: { attempt: examAttempt },
        params: {
          header: {
            "exam-environment-authorization-token": token,
          },
        },
      });
      span.setAttribute("http.response.status_code", r.response.status);
      return r;
    },
  );

  debugResponse(res);

  if (res.error) {
    if (res.error.code === "FCC_EINVAL_EXAM_ENVIRONMENT_EXAM_ATTEMPT") {
      logger.warn(res.error.message, res.error);
    } else {
      captureApiResponseError(res);
    }
    throw new ApiError(
      errorMessage(res),
      res.response.status,
      ENDPOINTS.examAttempt,
      res.error.code,
    );
  }

  return res.response;
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
          passingPercent: exam.config.passingPercent,
        },
        prerequisites: [],
      },
    ];
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: ENDPOINTS.exams, op: "http.client" },
    async (span) => {
      const r = await client.GET("/exam-environment/exams", {
        params: {
          header: {
            "exam-environment-authorization-token": token,
          },
        },
      });
      span.setAttribute("http.response.status_code", r.response.status);
      return r;
    },
  );

  debugResponse(res);

  if (res.error) {
    captureApiResponseError(res);
    throw new ApiError(
      errorMessage(res),
      res.response.status,
      ENDPOINTS.exams,
      res.error.code,
    );
  }

  return res.data;
}

export async function getAttemptsByExamId(examId: string) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: ENDPOINTS.examAttempts, op: "http.client" },
    async (span) => {
      const r = await client.GET(`/exam-environment/exams/{examId}/attempts`, {
        params: {
          path: { examId },
          header: {
            "exam-environment-authorization-token": token,
          },
        },
      });
      span.setAttribute("http.response.status_code", r.response.status);
      return r;
    },
  );

  if (res.error || res.response.status >= 300) {
    captureApiResponseError(res);
    throw new ApiError(
      "unable to get attempts for exam",
      res.response.status,
      ENDPOINTS.examAttempts,
    );
  }

  console.debug(res);

  return res.data;
}

/**
 * A pending update, as returned by the `check` command. `rid` identifies the update the backend is holding.
 */
export interface UpdateMetadata {
  rid: number;
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
  rawJson: Record<string, unknown>;
}

export async function checkForUpdate(): Promise<UpdateMetadata | null> {
  if (VITE_MOCK_DATA) {
    await delayForTesting(1000);
    // Comment out to test update functionality
    // throw new Error("Test: No update available");
    return null;
    // return {
    //   rid: 0,
    //   currentVersion: "0.0.1",
    //   version: "0.0.2",
    //   date: new Date().toUTCString(),
    //   body: "New update",
    //   rawJson: {},
    // };
  }

  const metadata = await startSpan(
    { name: "check_for_update", op: "app.update.check" },
    (span) => {
      const m = invoke<UpdateMetadata | null>("check");
      return m.then((value) => {
        span.setAttribute("update.available", !!value);
        return value;
      });
    },
  );
  if (metadata) {
    console.debug(
      `Found update ${metadata.version} from ${metadata.date} with notes ${metadata.body}`,
    );
    logUsage("update.available", {
      version: metadata.version,
      current_version: metadata.currentVersion,
    });
    return metadata;
  }
  return null;
}

export async function delayForTesting(t: number) {
  await new Promise((res, _) => setTimeout(res, t));
}

function debugResponse(res: FetchResponse<any, any, any>) {
  console.debug(
    res.response.status,
    res.response.url,
    res.data,
    res.error,
    res.response.statusText,
  );
}

interface StandardError {
  code: string;
  message: string;
}

// Message for thrown `Error`s. An `Error` without a message is titled
// "No error message" by Sentry, which groups unrelated failures together, and
// one carrying an uninformative body says no more to the user than it does to
// Sentry - so fall through both to whatever the response itself states.
function errorMessage(res: { error?: StandardError; response: Response }) {
  const { status, statusText } = res.response;
  const detail = [res.error?.message, res.error?.code, statusText].find(
    isInformative,
  );

  // The detail of a 5xx describes the server's internals, if anything: name the
  // failure as the user's - the request did not go through, and retrying is the
  // only thing they can do about it.
  if (status >= 500) {
    return `The freeCodeCamp server could not complete the request (${status}${
      detail ? `: ${detail}` : ""
    }). Please try again in a few moments.`;
  }

  return detail ?? `request failed with status ${status}`;
}
