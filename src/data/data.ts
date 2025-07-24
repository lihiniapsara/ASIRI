import type { Customer } from "../types/Customer"
import type { Item } from "../types/Item"
import type { Order } from "../types/Order"

export const customersData: Customer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main St, New York, NY 10001",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 234 567 8901",
    address: "456 Oak Ave, Los Angeles, CA 90001",
  },
]

export const itemsData: Item[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    price: 49.99,
  },
  {
    id: 3,
    name: "USB-C Cable",
    price: 12.99,
  },
  {
    id: 4,
    name: "Phone Case",
    price: 24.99,
  },
]

export const ordersData: Order[] = [
  {
    id: 1,
    customerId: 1,
    customerName: "John Doe",
    items: [
      { itemId: 1, itemName: "Wireless Headphones", price: 99.99, quantity: 1, subtotal: 99.99 },
      { itemId: 3, itemName: "USB-C Cable", price: 12.99, quantity: 2, subtotal: 25.98 },
    ],
    total: 125.97,
    date: "2025-05-27T10:30:00Z",
    status: "completed",
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Jane Smith",
    items: [{ itemId: 2, itemName: "Bluetooth Speaker", price: 49.99, quantity: 1, subtotal: 49.99 }],
    total: 49.99,
    date: "2025-05-27T14:15:00Z",
    status: "pending",
  },
]
