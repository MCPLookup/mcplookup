"use client"

import { cn } from '@/lib/utils'

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  color?: 'blue' | 'green' | 'orange' | 'yellow' | 'red' | 'purple';
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    value: 'text-blue-900',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    value: 'text-green-900',
    trend: 'text-green-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    value: 'text-orange-900',
    trend: 'text-orange-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    value: 'text-yellow-900',
    trend: 'text-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-900',
    trend: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-purple-900',
    trend: 'text-purple-600'
  }
}

export function AdminStatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className
}: AdminStatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={cn(
      "bg-white rounded-lg shadow border border-gray-200 p-6 transition-all hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className={cn("text-2xl font-bold", colors.value)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={cn("text-sm font-medium mt-1", colors.trend)}>
              {trend}
            </p>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          colors.bg
        )}>
          <span className={cn("text-xl", colors.icon)}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  )
}
