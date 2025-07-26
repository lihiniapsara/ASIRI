import apiClient from "./apiClient.ts";
import type { LendingFormData} from "../types/Lending.ts";

export const getLending = async () => {
    const response = await apiClient.get("/lending")
    return response.data
}

export const addLending = async (lendingData: Omit<LendingFormData, "_id">) => {
    const response = await apiClient.post("/lending", lendingData)
    return response.data
}