import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Materials } from "./pages/Materials";
import { Announcements } from "./pages/Announcements";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "tasks", Component: Tasks },
      { path: "materials", Component: Materials },
      { path: "announcements", Component: Announcements },
      { path: "users", Component: Users },
    ],
  },
]);