import apiClient from "./apiClient"
import type {QuizQuestion, QuizResult} from "../types/Quiz.ts";

// Submit quiz result
export const submitQuiz = async (result: {
    scores: number[];
    percentage: number;
    name: string;
    totalScore: number;
    email: string | null
}) => {
    try {
        const res = await apiClient.post("/quiz/submit", result)
        return res.data
    } catch (error) {
        console.error("submitQuiz error:", error)
        throw error
    }
}

// Get all quiz results
export const getQuizResults = async () => {
    try {
        const res = await apiClient.get("/quiz/results")
        return res.data as QuizResult[]
    } catch (error) {
        console.error("getQuizResults error:", error)
        throw error
    }
}

// Optional: fetch quiz questions from server
export const getQuizQuestions = async () => {
    try {
        const res = await apiClient.get("/quiz/questions")
        return res.data as QuizQuestion[]
    } catch (error) {
        console.error("getQuizQuestions error:", error)
        throw error
    }
}
