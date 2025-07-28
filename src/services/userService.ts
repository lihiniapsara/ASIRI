import apiClient from "./apiClient.ts";
import type {User} from "../types/User.ts";

export const createUser = async (userData: User) => {
    const response = await apiClient.post("/user", userData)
    return response.data
}

export const getAllUsers = async () => {
    const response = await apiClient.get("/user")
    return response.data
}

export const updateUser = async (_id: string, userData: Omit<User, "_id">) => {
    const response = await apiClient.put(`/user/${_id}`, userData)
    return response.data
}

export const deleteUser = async (_id: string) => {
    await apiClient.delete(`/user/${_id}`)
}
