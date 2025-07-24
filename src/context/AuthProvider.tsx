import { useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import apiClient, { setHeader } from "../services/apiClient"
import router from "../router"

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [accessToken, setAccessToken] = useState<string>("")
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true)

  const login = (token: string) => {
    setIsLoggedIn(true)
    setAccessToken(token)
  }

  const logout = () => setIsLoggedIn(false)

  useEffect(() => {
    setHeader(accessToken)
  }, [accessToken])

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const result = await apiClient.post("/auth/refresh-token")
        setAccessToken(result.data.accessToken)
        setIsLoggedIn(true)

        const currentPath = window.location.pathname
        if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/") {
          console.log("currentPath", currentPath)
          router.navigate("/dashboard")
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setAccessToken("")
        setIsLoggedIn(false)
      } finally {
        setIsAuthenticating(false)
      }
    }

    tryRefresh()
  }, [])

  return <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthenticating }}>{children}</AuthContext.Provider>
}
