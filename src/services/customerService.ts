import type { Customer } from "../types/Customer"
import apiClient from "./apiClient"

export const getAllCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get("/customers")
  return response.data
}

export const deleteCustomer = async (_id: string): Promise<void> => {
  await apiClient.delete(`/customers/${_id}`)
}

export const addCustomer = async (customerData: Omit<Customer, "_id">): Promise<Customer> => {
  const response = await apiClient.post("/customers", customerData)
  return response.data
}

export const updateCustomer = async (_id: string, customerData: Omit<Customer, "_id">) => {
  const response = await apiClient.put(`/customers/${_id}`, customerData)
  return response.data
}
