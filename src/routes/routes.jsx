import Home from "../pages/Home/Home";
import { Part1, Part2, Part2Test, Part3, Part4 } from "../pages/Parts";
import { Patients } from "../pages/patients/Patients";
import { Navigate } from "react-router-dom";

export default [
	{
		path: "home",
		element: <Home />,
	},
	{
		path:"patients",
		element:<Patients />
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
		path: "part3",
		element: <Part3 />,
	},
	{
		path: "part4",
		element: <Part4 />,
	},
	{
		path: "/",
		element: <Navigate to={"/home"} replace />,
	},
];
