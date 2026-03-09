'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AgeStructureChartProps {
  data: { group: string; count: number }[]
}

export default function AgeStructureChart({ data }: AgeStructureChartProps) {
  const chartData = {
    labels: data.map((d) => d.group),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Възрастова структура',
        font: { size: 16, weight: 'bold' as const, family: 'Inter, system-ui, sans-serif' },
        color: '#1f2937',
        padding: { top: 8, bottom: 16 },
      },
    },
  }

  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-600 text-base">
        Няма данни за възрастови групи
      </div>
    )
  }

  return (
    <div className="h-64">
      <Pie data={chartData} options={options} />
    </div>
  )
}
