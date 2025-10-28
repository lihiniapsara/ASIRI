import { createBrowserRouter } from "react-router-dom"
import Layout from "./pages/Layout"
import Login from "./components/LoginPage"
import Quiz from "./components/QuizPage"
import Expert from "./components/ExpertPage"
import Admin from "./components/AdminPage"

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
  {
    path: "/admin",
    element: <Admin />,
  }
])

export default router