'use client'

import Link from 'next/link'
import { Shield, Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { SectionOverview, SectionsStats } from '@/app/actions/sections'

interface SectionsTableProps {
  sections: SectionOverview[]
  stats: SectionsStats
}

function StatusBadge({ status }: { status: SectionOverview['status'] }) {
  switch (status) {
    case 'full':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          Покрита
        </span>
      )
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          Частично
        </span>
      )
    case 'empty':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3" />
          Липсва
        </span>
      )
  }
}

function PersonList({ people }: { people: { id: number; fullName: string }[] }) {
  if (people.length === 0) {
    return <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {people.map(p => (
        <Link
          key={p.id}
          href={`/directory/${p.id}`}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          {p.fullName}
        </Link>
      ))}
    </div>
  )
}

export default function SectionsTable({ sections, stats }: SectionsTableProps) {
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Покрити секции</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stats.coveredSections} <span className="text-base font-normal text-slate-400">/ {stats.totalSections}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Застъпници</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalRepresentatives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Членове на СИК</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalCommissionMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Секция</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Град</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Застъпници</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Членове СИК</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {sections.map((section, i) => (
                <tr
                  key={section.id}
                  className={
                    section.status === 'empty'
                      ? 'bg-red-50/50 dark:bg-red-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }
                >
                  <td className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 font-mono">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{section.label}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{section.city}</td>
                  <td className="px-4 py-3">
                    <PersonList people={section.representatives} />
                  </td>
                  <td className="px-4 py-3">
                    <PersonList people={section.commissionMembers} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={section.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
