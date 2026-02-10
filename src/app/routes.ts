import { createBrowserRouter } from "react-router-dom";
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
import { ValidatorNode } from "./pages/ValidatorNode";
import { Reputation } from "./pages/Reputation";
import { Marketplace } from "./pages/Marketplace";
import { Profile } from "./pages/Profile";
import { InfraMarket } from "./pages/InfraMarket";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "fitness", Component: Arena },
      { path: "civic", Component: CivicArena },
      { path: "asset", Component: AssetArena },
      { path: "commute", Component: CommuteArena },
      { path: "hostel-league", Component: HostelLeague },
      { path: "wallet", Component: MyWallet },
      { path: "leaderboard", Component: Leaderboard },
      { path: "admin", Component: Admin },
      { path: "validator", Component: ValidatorNode },
      { path: "reputation", Component: Reputation },
      { path: "marketplace", Component: Marketplace },
      { path: "infrastructure", Component: InfraMarket },
      { path: "profile", Component: Profile },
    ],
  },
]);
