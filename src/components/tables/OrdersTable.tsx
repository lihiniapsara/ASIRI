import React from "react"
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md"
import type { Order } from "../../types/Order"

interface OrdersTableProps {
  orders: Order[]
  onView: (order: Order) => void
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onView, onEdit, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className='bg-white shadow-md rounded-lg overflow-hidden'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Order ID</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Customer</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Items</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Total</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className='px-6 py-4 text-center text-gray-500'>
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>#{order.id}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{order.customerName}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{order.items.length} item(s)</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold'>
                  {formatPrice(order.total)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{formatDate(order.date)}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(order.status)}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onView(order)}
                      className='text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition duration-150'
                    >
                      <MdVisibility className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => onEdit(order)}
                      className='text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition duration-150'
                    >
                      <MdEdit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => onDelete(order)}
                      className='text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition duration-150'
                    >
                      <MdDelete className='w-4 h-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable
