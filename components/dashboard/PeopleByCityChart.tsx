'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PeopleByCityChartProps {
  data: { city: string; _count: { id: number } }[]
}

export default function PeopleByCityChart({ data }: PeopleByCityChartProps) {
  const router = useRouter()

  const handleClick = useCallback((event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index
      const city = data[index]?.city
      if (city) {
        router.push(`/directory?city=${encodeURIComponent(city)}`)
      }
    }
  }, [data, router])

  const chartData = {
    labels: data.map((d) => d.city || 'Без град'),
    datasets: [
      {
        label: 'Брой членове',
        data: data.map((d) => d._count.id),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cursor: 'pointer',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleClick,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Членове по градове (кликни за филтриране)',
        font: { size: 14 },
        color: '#374151',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.raw} членове`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Няма данни за градове
      </div>
    )
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
