import React from "react"
import { MdPeople, MdInventory, MdShoppingCart, MdAttachMoney } from "react-icons/md"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, color }) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>{value}</p>
          {change && (
            <div className='flex items-center mt-2'>
              <span className={`text-sm font-medium ${change.type === "increase" ? "text-green-600" : "text-red-600"}`}>
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}%
              </span>
              <span className='text-sm text-gray-500 ml-1'>from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  totalCustomers: number
  totalItems: number
  totalOrders: number
  totalRevenue: number
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ totalCustomers, totalItems, totalOrders, totalRevenue }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <MdPeople className='w-6 h-6 text-blue-600' />,
      change: { value: 12, type: "increase" as const },
      color: "bg-blue-100",
    },
    {
      title: "Total Items",
      value: totalItems,
      icon: <MdInventory className='w-6 h-6 text-green-600' />,
      change: { value: 8, type: "increase" as const },
      color: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <MdShoppingCart className='w-6 h-6 text-purple-600' />,
      change: { value: 5, type: "decrease" as const },
      color: "bg-purple-100",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: <MdAttachMoney className='w-6 h-6 text-yellow-600' />,
      change: { value: 15, type: "increase" as const },
      color: "bg-yellow-100",
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

export default DashboardStats
