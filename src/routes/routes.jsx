import Home from "../pages/Home/Home";
import { Part1, Part2 } from "../pages/Parts";
import { Navigate } from "react-router-dom";

export default [
  {
    path: "home",
    element: <Home />,
  },
  {
    path: "part1",
    element: <Part1 />,
  },
  {
    path: "part2",
    element: <Part2 />,
  },
  {
    path: "/",
    element: <Navigate to={"/home"} replace />,
  },
];
