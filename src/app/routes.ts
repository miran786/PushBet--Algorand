import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CivicArena } from "./pages/CivicArena";
import { AssetArena } from "./pages/AssetArena";
import { CommuteArena } from "./pages/CommuteArena";
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
      { index: true, Component: Dashboard },
      { path: "fitness", Component: Arena },
      { path: "civic", Component: CivicArena },
      { path: "asset", Component: AssetArena },
      { path: "commute", Component: CommuteArena },
      { path: "hostel-league", Component: HostelLeague },
      { path: "wallet", Component: MyWallet },
      { path: "leaderboard", Component: Leaderboard },
      { path: "admin", Component: Admin },
    ],
  },
]);
