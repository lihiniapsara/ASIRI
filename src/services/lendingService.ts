import apiClient from "./apiClient.ts";
import type { LendingFormData} from "../types/Lending.ts";

export const getLending = async () => {
    const response = await apiClient.get("/lending")
    return response.data
}

export const addLending = async (lendingData: LendingFormData) => {
    const response = await apiClient.post("/lending", lendingData)
    return response.data
}

export const deleteLending = async (_id: string) => {
    await apiClient.delete(`/lending/${_id}`)
}

export const updateLending = async (_id: string, lendingData: Omit<LendingFormData, "_id">) => {
    const response = await apiClient.put(`/lending/${_id}`, lendingData)
    return response.data
}

export const markAsReturned = async (_id: string) => {
    console.log(_id , " returned ,,,,,,");
    const response = await apiClient.put(`/lending/return/${_id}`)
    return response.data
}