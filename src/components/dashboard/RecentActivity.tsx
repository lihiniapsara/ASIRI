import React from "react"
import { MdShoppingCart, MdPerson, MdInventory } from "react-icons/md"

interface Activity {
  id: number
  type: "order" | "customer" | "item"
  message: string
  time: string
}

interface RecentActivityProps {
  activities: Activity[]
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return <MdShoppingCart className='w-5 h-5 text-blue-600' />
      case "customer":
        return <MdPerson className='w-5 h-5 text-green-600' />
      case "item":
        return <MdInventory className='w-5 h-5 text-purple-600' />
      default:
        return <MdShoppingCart className='w-5 h-5 text-gray-600' />
    }
  }

  const getActivityBgColor = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return "bg-blue-100"
      case "customer":
        return "bg-green-100"
      case "item":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Activity</h3>
      <div className='space-y-4'>
        {activities.length === 0 ? (
          <p className='text-gray-500 text-center py-4'>No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className='flex items-start space-x-3'>
              <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-gray-900'>{activity.message}</p>
                <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentActivity
