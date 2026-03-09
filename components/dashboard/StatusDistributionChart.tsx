'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface StatusDistributionChartProps {
  data: { status: string; count: number }[]
}

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(148, 163, 184, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(20, 184, 166)',
          'rgb(148, 163, 184)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      title: {
        display: true,
        text: 'Разпределение по статус',
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
        Няма данни
      </div>
    )
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
