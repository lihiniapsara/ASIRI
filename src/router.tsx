import { createBrowserRouter } from "react-router-dom"
import Layout from "./pages/Layout"
import Login from "./components/LoginPage"
import Quiz from "./components/QuizPage"
import Expert from "./components/ExpertPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/quiz", element: <Quiz />},
      { path: "/expert", element: <Expert />},
    ],
  },
])

export default router