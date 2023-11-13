import { ThemeProvider } from "@emotion/react";
import { lightTheme } from "./styles/theme";
import {
  redirect,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { Suspense } from "react";

const NotFound = React.lazy(() => import("./pages/NotFound"));

const router = createBrowserRouter(
  [
    {
      path: "/",
      lazy: () =>
        import("./pages/Landing").then((module) => ({
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <module.default />
            </Suspense>
          ),
          errorElement: <NotFound />,
        })),
    },
    {
      path: "/:linkId",
      loader: async ({ params: { linkId } }) => {
        return redirect(`${process.env.API_BASE_URL}/url/${linkId}`, 302);
      },
      errorElement: <NotFound />,
    },
    {
      path: "/404/:linkId",
      element: <NotFound />,
    },
  ],
  {}
);

export const App = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <RouterProvider router={router} />
      <ToastContainer />
    </ThemeProvider>
  );
};

export default App;
