import apiClient from "./apiClient.ts";
import type {Email} from "../types/Email.ts";

export const emailSender = async (emailData: Email) => {
    try {
        const response = await apiClient.post('/email', emailData);
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}