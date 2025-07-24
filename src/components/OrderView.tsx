import React from "react"
import type { Order } from "../types/Order"

interface OrderViewProps {
  order: Order
}

const OrderView: React.FC<OrderViewProps> = ({ order }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Order Header */}
      <div className='border-b pb-4'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-xl font-semibold text-gray-900'>Order #{order.id}</h3>
            <p className='text-gray-600 mt-1'>Customer: {order.customerName}</p>
            <p className='text-gray-600'>Date: {formatDate(order.date)}</p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className='text-lg font-medium text-gray-900 mb-3'>Items</h4>
        <div className='space-y-2'>
          {order.items.map((item) => (
            <div key={item.itemId} className='flex justify-between items-center p-3 bg-gray-50 rounded-md'>
              <div>
                <span className='font-medium'>{item.itemName}</span>
                <span className='text-gray-500 ml-2'>× {item.quantity}</span>
              </div>
              <div className='text-right'>
                <div className='font-semibold'>{formatPrice(item.subtotal)}</div>
                <div className='text-sm text-gray-500'>{formatPrice(item.price)} each</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className='border-t pt-4'>
        <div className='flex justify-between items-center text-xl font-bold'>
          <span>Total:</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderView
