import Home from "../pages/Home/Home"


export default [
    {
        path: "home",
        element: <Home />,
    },
    {
        path: "part1",
       
    },
    {
        path: "part2",
       
    },
    {
        path: "/",
        element: <Navigate to={"/home"} replace />,
    }
]