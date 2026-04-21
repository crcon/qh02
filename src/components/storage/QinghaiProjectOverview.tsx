/**
 * @file QinghaiProjectOverview.tsx
 * @description Static overview of the Qinghai Haixi 300MW/1200MWh independent storage project,
 * including key technical parameters, investment scale, and annual revenue breakdown (neutral scenario).
 */

import React from 'react'

/**
 * ProjectRevenueItem
 * @description Data shape for displaying a single revenue category in the overview.
 */
interface ProjectRevenueItem {
  key: string
  label: string
  valueWan: number
  color: string
}

/**
 * QinghaiProjectOverview
 * @description Presents the 300MW/1200MWh Haixi independent storage project investment
 * and the neutral-scenario annual revenue breakdown, based on the provided analysis report.
 */
export const QinghaiProjectOverview: React.FC = () => {
  // Annual revenue data in ten-thousand RMB (万元), neutral scenario from the report.
  const revenueItems: ProjectRevenueItem[] = [
    {
      key: 'spot',
      label: '现货价差套利',
      valueWan: 11200,
      color: 'bg-emerald-500',
    },
    {
      key: 'capacity',
      label: '容量补偿',
      valueWan: 4613,
      color: 'bg-sky-500',
    },
    {
      key: 'leasing',
      label: '容量租赁',
      valueWan: 2400,
      color: 'bg-amber-500',
    },
    {
      key: 'aux',
      label: '辅助服务',
      valueWan: 400,
      color: 'bg-purple-500',
    },
    {
      key: 'call',
      label: '调用补偿',
      valueWan: 400,
      color: 'bg-pink-500',
    },
  ]

  const totalWan = revenueItems.reduce((sum, item) => sum + item.valueWan, 0)
  const totalYi = totalWan / 10000

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-8 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:px-8 lg:py-7">
        {/* Left: project facts */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            海西 300MW/1200MWh 独立储能项目 · 中性情景
          </div>

          <div className="space-y-2">
            <h2
              id="project-overview-heading"
              className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              海西 300MW/1200MWh 独立储能电站 · 投资与收益概览
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              基于青海电力现货市场规则 V6.0、电发改〔2025〕136 号文以及青海省发电侧容量电价机制（征求意见稿），
              按综合投资单价 1,200 元/kWh 测算海西州 300MW/1200MWh 独立储能电站的年度收益结构。
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-3">
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">装机功率</dt>
              <dd className="text-base font-semibold">300 MW</dd>
            </div>
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">储能容量 / 时长</dt>
              <dd className="text-base font-semibold">1200 MWh · 4 h</dd>
            </div>
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">综合投资单价</dt>
              <dd className="text-base font-semibold">1,200 元 / kWh</dd>
            </div>
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">项目总投资</dt>
              <dd className="text-base font-semibold">14.4 亿元</dd>
            </div>
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">年总收入（中性）</dt>
              <dd className="text-base font-semibold">
                {totalYi.toFixed(2)} 亿元
                <span className="ml-1 text-xs font-normal text-slate-500">
                  （{totalWan.toLocaleString()} 万元）
                </span>
              </dd>
            </div>
            <div className="space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-medium text-slate-500">项目类型 / 区域</dt>
              <dd className="text-base font-semibold">
                电网侧独立储能 · 青海海西州
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: revenue breakdown */}
        <div className="flex-1 space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:p-5">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            年度收益结构（中性情景）
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            {revenueItems.map((item) => {
              const ratio = totalWan > 0 ? item.valueWan / totalWan : 0
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${item.color}`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-slate-900">
                        {item.valueWan.toLocaleString()} 万元
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {ratio > 0 ? `${(ratio * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.max(ratio * 100, 1)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            注：数据来源于《青海省海西 300MW/1200MWh 独立储能电站项目收益分析报告》
            中性情景年度收益测算（现货价差约 0.50 元/kWh，容量补偿标准 165 元/kW·年，
            容量供需系数 1.04，容量租赁 200 元/kW·年、出租率约 70% 等假设），仅作测算示例。
          </p>
        </div>
      </div>
    </div>
  )
}
