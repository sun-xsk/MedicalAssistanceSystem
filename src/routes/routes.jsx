import React from 'react'
import Home from "../pages/Home/Home";
import { Part1, Part2, Part2Test } from "../pages/Parts";
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
    element: <Part2Test />,
  },
  {
    path: "/",
    element: <Navigate to={"/home"} replace />,
  },
];
