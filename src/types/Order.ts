export type Order = {
  id: number
  customerId: number
  customerName: string
  items: OrderItem[]
  total: number
  date: string
  status: "pending" | "completed" | "cancelled"
}

export type OrderItem = {
  itemId: number
  itemName: string
  price: number
  quantity: number
  subtotal: number
}
