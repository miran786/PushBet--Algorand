import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Arena } from "./pages/Arena";
import { HostelLeague } from "./pages/HostelLeague";
import { MyWallet } from "./pages/MyWallet";
import { Leaderboard } from "./pages/Leaderboard";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Arena },
      { path: "hostel-league", Component: HostelLeague },
      { path: "wallet", Component: MyWallet },
      { path: "leaderboard", Component: Leaderboard },
      { path: "admin", Component: Admin },
    ],
  },
]);
