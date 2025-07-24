import apiClient from "./apiClient.ts";
import type {Reader} from "../types/Reader.ts";

export const getAllReaders = async () => {
    const response = await apiClient.get("/reader")
    return response.data
}

export const addReader = async (readerData: Omit<Reader, "_id">) => {
    const response = await apiClient.post("/reader", readerData)
    return response.data
}

export const updateReader = async (_id: string, readerData: Omit<Reader, "_id">) => {
    const response = await apiClient.put(`/reader/${_id}`, readerData)
    return response.data
}

export const deleteReader = async (_id: string) => {
    await apiClient.delete(`/reader/${_id}`)
}
