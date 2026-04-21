/**
 * @file SiteHeader.tsx
 * @description Top header and brand bar for the Qinghai independent storage专题 website.
 */

import React from 'react'
import { BatteryCharging, Mountain } from 'lucide-react'

/**
 * SiteHeader
 * @description Renders the site header with branding, subtitle, and simple navigation anchors.
 */
export const SiteHeader: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <BatteryCharging className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              易储能源 · 青海省独立储能专栏
            </h1>
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
              <Mountain className="h-4 w-4 text-sky-500" />
              青海现货市场 × 容量补偿机制 × 独立储能收益可视化
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-4 text-xs font-medium text-slate-600 sm:flex sm:text-sm">
          <a
            href="#project-overview-heading"
            className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
          >
            海西 300MW 项目
          </a>
          <a
            href="#calculator-heading"
            className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
          >
            投资收益测算
          </a>
        </nav>
      </div>
    </header>
  )
}
