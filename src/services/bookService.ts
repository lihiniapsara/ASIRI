import apiClient from "./apiClient.ts";
import type { BookFormData} from "../types/Book.ts";

export const getBooks = async () => {
    const response = await apiClient.get("/book")
    return response.data
}

export const addBook = async (bookData: BookFormData) => {
    const response = await apiClient.post("/book", bookData)
    return response.data
}

export const deleteBook = async (_id: string) => {
    await apiClient.delete(`/book/${_id}`)
}

export const updateBook = async (_id: string, bookData: Omit<BookFormData, "_id">) => {
    const response = await apiClient.put(`/book/${_id}`, bookData)
    return response.data
}