import React, { useState, useEffect } from "react"
import { MdAdd, MdRemove, MdDelete } from "react-icons/md"
import type { Order, OrderItem } from "../../types/Order"
import type { Customer } from "../../types/Customer"
import type { Item } from "../../types/Item"

interface OrderFormProps {
  order?: Order | null
  customers: Customer[]
  items: Item[]
  onSubmit: (orderData: Omit<Order, "id" | "date">) => void
}

interface FormErrors {
  customer?: string
  items?: string
}

const OrderForm: React.FC<OrderFormProps> = ({ order, customers, items, onSubmit }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Order["status"]>("pending")

  useEffect(() => {
    if (order) {
      setSelectedCustomerId(order.customerId)
      setOrderItems(order.items)
      setStatus(order.status)
    } else {
      setSelectedCustomerId(null)
      setOrderItems([])
      setStatus("pending")
    }
    setErrors({})
  }, [order])

  const addItem = (item: Item) => {
    const existingItem = orderItems.find((oi) => oi.itemId === item.id)

    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((oi) =>
          oi.itemId === item.id ? { ...oi, quantity: oi.quantity + 1, subtotal: (oi.quantity + 1) * oi.price } : oi
        )
      )
    } else {
      const newOrderItem: OrderItem = {
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        quantity: 1,
        subtotal: item.price,
      }
      setOrderItems((prev) => [...prev, newOrderItem])
    }
  }

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    setOrderItems((prev) =>
      prev.map((oi) => (oi.itemId === itemId ? { ...oi, quantity: newQuantity, subtotal: newQuantity * oi.price } : oi))
    )
  }

  const removeItem = (itemId: number) => {
    setOrderItems((prev) => prev.filter((oi) => oi.itemId !== itemId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!selectedCustomerId) {
      newErrors.customer = "Please select a customer"
    }

    if (orderItems.length === 0) {
      newErrors.items = "Please add at least one item to the order"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
      if (selectedCustomer) {
        onSubmit({
          customerId: selectedCustomerId!,
          customerName: selectedCustomer.name,
          items: orderItems,
          total: calculateTotal(),
          status,
        })
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Customer Selection */}
      <div>
        <label htmlFor='customer' className='block text-sm font-medium text-gray-700 mb-1'>
          Customer
        </label>
        <select
          id='customer'
          value={selectedCustomerId || ""}
          onChange={(e) => {
            setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)
            if (errors.customer) {
              setErrors((prev) => ({ ...prev, customer: undefined }))
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.customer ? "border-red-300" : "border-gray-300"
          }`}
        >
          <option value=''>Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.email}
            </option>
          ))}
        </select>
        {errors.customer && <p className='mt-1 text-sm text-red-600'>{errors.customer}</p>}
      </div>

      {/* Status Selection (for editing) */}
      {order && (
        <div>
          <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-1'>
            Status
          </label>
          <select
            id='status'
            value={status}
            onChange={(e) => setStatus(e.target.value as Order["status"])}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>
        </div>
      )}

      {/* Available Items */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-3'>Available Items</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3'>
          {items.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => addItem(item)}
              className='flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition duration-150'
            >
              <span className='text-sm'>{item.name}</span>
              <span className='text-sm font-semibold'>{formatPrice(item.price)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-3'>Order Items</h3>
        {orderItems.length === 0 ? (
          <div className='text-center py-8 text-gray-500 border border-gray-200 rounded-md'>
            No items selected. Click on items above to add them to the order.
          </div>
        ) : (
          <div className='space-y-2'>
            {orderItems.map((orderItem) => (
              <div
                key={orderItem.itemId}
                className='flex items-center justify-between p-3 border border-gray-200 rounded-md'
              >
                <div className='flex-1'>
                  <span className='font-medium'>{orderItem.itemName}</span>
                  <span className='text-gray-500 ml-2'>{formatPrice(orderItem.price)} each</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    type='button'
                    onClick={() => updateQuantity(orderItem.itemId, orderItem.quantity - 1)}
                    className='p-1 text-gray-500 hover:text-gray-700'
                  >
                    <MdRemove className='w-4 h-4' />
                  </button>
                  <span className='w-8 text-center'>{orderItem.quantity}</span>
                  <button
                    type='button'
                    onClick={() => updateQuantity(orderItem.itemId, orderItem.quantity + 1)}
                    className='p-1 text-gray-500 hover:text-gray-700'
                  >
                    <MdAdd className='w-4 h-4' />
                  </button>
                  <span className='w-20 text-right font-semibold'>{formatPrice(orderItem.subtotal)}</span>
                  <button
                    type='button'
                    onClick={() => removeItem(orderItem.itemId)}
                    className='p-1 text-red-500 hover:text-red-700'
                  >
                    <MdDelete className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.items && <p className='mt-1 text-sm text-red-600'>{errors.items}</p>}
      </div>

      {/* Order Total */}
      {orderItems.length > 0 && (
        <div className='border-t pt-4'>
          <div className='flex justify-between items-center text-lg font-bold'>
            <span>Total:</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
        </div>
      )}
    </form>
  )
}

export default OrderForm
