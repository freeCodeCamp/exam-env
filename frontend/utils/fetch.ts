import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import createClient, { FetchResponse } from "openapi-fetch";
import { captureException, logger, startSpan } from "@sentry/react";
import {
  DownloadEvent,
  DownloadOptions,
  Update,
} from "@tauri-apps/plugin-updater";

import type { paths } from "../../prisma/api-schema";
import { UserExam, UserExamAttempt } from "./types";
import { VITE_MOCK_DATA } from "./env";
import { deserializeDates } from "./serde";
import { ErrorResponse } from "./errors";
import { logUsage } from "./telemetry";

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
    { name: "GET /exam-environment/token-meta", op: "http.client" },
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
      captureError(res);
    }
    throw new Error(errorMessage(res));
  }

  if (res.response.status >= 400) {
    throw new Error(res.response.statusText);
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
    { name: "POST /exam-environment/exam/generated-exam", op: "http.client" },
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
      captureError(res);
    }
    throw new Error(errorMessage(res));
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
    throw new Error(error.message);
    // return undefined as never;
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: "POST /exam-environment/exam/attempt", op: "http.client" },
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
      captureError(res);
    }
    throw new Error(errorMessage(res));
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
    { name: "GET /exam-environment/exams", op: "http.client" },
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
    captureError(res);
    throw new Error(errorMessage(res));
  }

  return res.data;
}

export async function getAttemptsByExamId(examId: string) {
  if (VITE_MOCK_DATA) {
    await delayForTesting(800);
  }

  const token = await invoke<string>("get_authorization_token");

  const res = await startSpan(
    { name: "GET /exam-environment/exams/{examId}/attempts", op: "http.client" },
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
    captureError(res);
    throw new Error("unable to get attempts for exam");
  }

  console.debug(res);

  return res.data;
}

interface UpdateMetadata {
  rid: number;
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
  rawJson: Record<string, unknown>;
}

export async function checkForUpdate() {
  if (VITE_MOCK_DATA) {
    await delayForTesting(1000);

    class MockUpdate extends Update {
      constructor(metadata: UpdateMetadata) {
        super(metadata);
      }
      download(
        _onEvent?: (progress: DownloadEvent) => void,
        _options?: DownloadOptions,
      ): Promise<void> {
        return new Promise((res) => res());
      }
      install(): Promise<void> {
        return new Promise((res) => res());
      }
      async downloadAndInstall(
        onEvent?: (progress: DownloadEvent) => void,
        _options?: DownloadOptions,
      ): Promise<void> {
        if (onEvent) {
          onEvent({
            data: {
              contentLength: 100,
            },
            event: "Started",
          });
          for (let i = 0; i < 100; i++) {
            await delayForTesting(50);
            onEvent({
              data: {
                chunkLength: i,
              },
              event: "Progress",
            });
          }
          onEvent({
            event: "Finished",
          });
        }
      }
      close(): Promise<void> {
        return new Promise((res) => res());
      }
    }
    // Comment out to test update functionality
    // throw new Error("Test: No update available");
    return null;
    // return new MockUpdate({
    //   rid: 0,
    //   currentVersion: "0.0.1",
    //   version: "0.0.2",
    //   date: new Date().toUTCString(),
    //   body: "New update",
    //   rawJson: {},
    // });
  }

  const metadata = await startSpan(
    { name: "check_for_update", op: "app.update.check" },
    (span) => {
      const m = invoke<UpdateMetadata>("check");
      return m.then((value) => {
        span.setAttribute("update.available", !!value);
        return value;
      });
    },
  );
  if (metadata) {
    const update = new Update(metadata);
    console.debug(
      `Found update ${update.version} from ${update.date} with notes ${update.body}`,
    );
    logUsage("update.available", {
      version: update.version,
      current_version: update.currentVersion,
    });
    return update;
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

// `error` is optional so non-2xx responses without a parsed error body (e.g.
// getAttemptsByExamId's `status >= 300` guard) can also be captured.
function captureError(res: { error?: StandardError; response: Response }) {
  if (res.error?.code && res.error?.message) {
    const se = new Error(
      `${res.error.code}: ${res.error.message}; ${res.response.statusText}`,
    );
    captureException(se);
  } else {
    const se = new Error(`Unknown error: ${JSON.stringify(res)}`);
    captureException(se);
  }
}

// Message for thrown `Error`s. An `Error` without a message is titled
// "No error message" by Sentry, which groups unrelated failures together.
function errorMessage(res: { error?: StandardError; response: Response }) {
  return (
    res.error?.message ||
    res.error?.code ||
    res.response.statusText ||
    `request failed with status ${res.response.status}`
  );
}
