import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  LoaderFunction,
  redirect,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Error as ErrorPage } from "./pages/error";
import { Landing } from "./pages/landing";
import { Exam } from "./pages/exam";
import { Login } from "./pages/login";
import { Test } from "./pages/test";
import { Splashscreen } from "./pages/splashscreen";
import { ExamLanding } from "./pages/exam-landing";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/auth";
import { ProtectedRoute } from "./components/protected-route";
import { getGeneratedExam } from "./utils/fetch";

import "./index.css";
import "@freecodecamp/ui/dist/base.css";

if (import.meta.env.VITE_MOCK_DATA === "true" && import.meta.env.PROD) {
  throw new Error(
    "May not build application in production using VITE_MOCK_DATA flag"
  );
}

const queryClient = new QueryClient();

const examLoader: LoaderFunction = async ({ params }) => {
  const examData = await getGeneratedExam(params.examId!);
  if (examData.code) {
    // TODO: Prevent camera from starting up
    return redirect(
      `/landing?flashKind=warning&flashMessage=${examData.message}`
    );
  }

  return examData;
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Splashscreen />,
    errorElement: <ErrorPage info="404: Unknown Page" />,
  },
  {
    path: "/error",
    element: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/exam/:examId",
    element: (
      <ProtectedRoute>
        <Exam />
      </ProtectedRoute>
    ),
    loader: examLoader,
  },
  {
    path: "/landing",
    element: (
      <ProtectedRoute>
        <Landing />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/exam-landing/:examId",
    element: <ExamLanding />,
  },
];

import.meta.env.DEV &&
  routes.push({
    path: "/test",
    element: <Test />,
  });

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider>
          <RouterProvider router={router} />
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
