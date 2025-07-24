import React from "react"
import { MdEdit, MdDelete } from "react-icons/md"
import type { Item } from "../../types/Item"

interface ItemsTableProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, onEdit, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className='bg-white shadow-md rounded-lg overflow-hidden'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>ID</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className='px-6 py-4 text-center text-gray-500'>
                No items found
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{item.id}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{item.name}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold'>
                  {formatPrice(item.price)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onEdit(item)}
                      className='text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition duration-150'
                    >
                      <MdEdit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
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

export default ItemsTable
