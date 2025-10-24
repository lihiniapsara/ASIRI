// userService.ts (fixed)
import apiClient from "./apiClient";
import type {User} from "../types/User.ts";

export const registerUser = async (user: User) => {
    try {
        const response = await apiClient.post("/users/register", user);  // Already good, but confirm
        return response.data;
    } catch (error: any) {
        console.error("Registration error:", error.response?.data || error.message);
        throw error;
    }
};