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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PeopleByCityChartProps {
  data: { city: string; _count: { id: number } }[]
}

export default function PeopleByCityChart({ data }: PeopleByCityChartProps) {
  const chartData = {
    labels: data.map((d) => d.city || 'Без град'),
    datasets: [
      {
        label: 'Брой членове',
        data: data.map((d) => d._count.id),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Членове по градове',
        font: { size: 14 },
        color: '#374151',
      },
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
