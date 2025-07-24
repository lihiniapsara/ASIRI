import { createBrowserRouter } from "react-router-dom"
import Layout from "./pages/Layout"
import Login from "./pages/LoginPage"
import Signup from "./pages/SignUpPage"
import AdminRoutes from "./pages/AdminRoutes"
import ReaderManagePage from "./pages/ReaderManage.tsx";
import BooksPage from "./pages/BooksPage.tsx";
import LendingNotify from "./pages/LendingNotify.tsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        element: <AdminRoutes />,
        children: [
          { path: "/dashboard", element: <div>Dashboard</div> },
          { path: "/readers", element: <ReaderManagePage /> },
          { path: "/books", element: <BooksPage /> },
          { path: "/lendings", element: <LendingNotify /> },
        ],
      },
    ],
  },
])

export default router
