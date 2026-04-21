/**
 * @file QinghaiStorageCalculator.tsx
 * @description Interactive calculator module for Qinghai independent storage projects.
 * Users can adjust system and policy parameters, and the component will compute
 * annual total revenue and category-wise revenues in real time,
 * following the policy and spot market logic described in the provided documents.
 */

import React, { useMemo, useState, ChangeEvent } from 'react'
import { Calculator, LineChart, SlidersHorizontal } from 'lucide-react'

/**
 * StorageInputs
 * @description Core adjustable parameters for an independent storage project in Qinghai.
 */
interface StorageInputs {
  // Project technical parameters
  powerMW: number
  energyMWh: number
  roundTripEfficiency: number
  capacityAvailability: number
  cyclesPerDay: number
  daysPerYear: number

  // Capex (for reference display)
  capexPerKWh: number

  // Spot market parameters
  spotSpreadYuanPerKWh: number

  // Capacity price mechanism parameters
  capacityStandardYuanPerKWYear: number
  capacitySupplyDemandCoeff: number
  storagePlantUseRate: number
  systemPeakDurationHours: number

  // Capacity leasing parameters
  leasePriceYuanPerKWYear: number
  leaseRatio: number

  // Auxiliary services parameters
  auxPriceYuanPerKWh: number
  auxHoursPerYear: number
  auxUtilization: number

  // Other subsidies
  otherSubsidyWanPerYear: number
}

/**
 * StorageRevenues
 * @description Computed annual revenues (in ten-thousand RMB, 万元) by category.
 */
interface StorageRevenues {
  spotWan: number
  capacityWan: number
  leasingWan: number
  auxWan: number
  otherWan: number
  totalWan: number
}

/**
 * NumberInputProps
 * @description Props for a simple labeled numeric input element.
 */
interface NumberInputProps {
  label: string
  value: number
  unit?: string
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  helperText?: string
}

/**
 * LabeledNumberInput
 * @description Controlled numeric input with label and helper text, used throughout the calculator.
 */
const LabeledNumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  helperText,
}) => {
  /**
   * Handles input change and normalizes to a finite number.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) {
      onChange(0)
    } else {
      onChange(parsed)
    }
  }

  return (
    <label className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-900">{label}</span>
        {unit ? <span className="text-[11px] text-slate-500">{unit}</span> : null}
      </div>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm outline-none ring-offset-white transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      />
      {helperText ? <p className="text-[11px] text-slate-9000">{helperText}</p> : null}
    </label>
  )
}

/**
 * computeRevenues
 * @description Computes annual revenues by category based on the provided inputs,
 * following the formulas derived from the Qinghai market rules and the analysis report.
 */
const computeRevenues = (inputs: StorageInputs): StorageRevenues => {
  const {
    powerMW,
    energyMWh,
    roundTripEfficiency,
    capacityAvailability,
    cyclesPerDay,
    daysPerYear,
    spotSpreadYuanPerKWh,
    capacityStandardYuanPerKWYear,
    capacitySupplyDemandCoeff,
    storagePlantUseRate,
    systemPeakDurationHours,
    leasePriceYuanPerKWYear,
    leaseRatio,
    auxPriceYuanPerKWh,
    auxHoursPerYear,
    auxUtilization,
    otherSubsidyWanPerYear,
  } = inputs

  const powerKW = Math.max(powerMW, 0) * 1000
  const energyKWh = Math.max(energyMWh, 0) * 1000

  // Derived: storage duration in hours
  const durationHours = powerMW > 0 ? energyMWh / powerMW : 0

  // 1) Spot arbitrage revenue: per report logic
  // Daily discharge energy (kWh) = capacity * availability * round-trip efficiency * cyclesPerDay
  const dailyDischargeKWh =
    energyKWh * Math.max(capacityAvailability, 0) * Math.max(roundTripEfficiency, 0) * Math.max(cyclesPerDay, 0)

  const annualSpotRevenueYuan =
    dailyDischargeKWh * Math.max(spotSpreadYuanPerKWh, 0) * Math.max(daysPerYear, 0)

  // 2) Capacity price mechanism revenue
  const reliabilityFactor =
    systemPeakDurationHours > 0 ? Math.min(durationHours / systemPeakDurationHours, 1) : 0

  const effectiveCapacityKW =
    powerKW * (1 - Math.max(Math.min(storagePlantUseRate, 0.5), 0)) * Math.max(Math.min(reliabilityFactor, 1), 0)

  const annualCapacityRevenueYuan =
    effectiveCapacityKW * Math.max(capacityStandardYuanPerKWYear, 0) * Math.max(capacitySupplyDemandCoeff, 0)

  // 3) Capacity leasing revenue
  const annualLeasingRevenueYuan =
    powerKW * Math.max(Math.min(leaseRatio, 1), 0) * Math.max(leasePriceYuanPerKWYear, 0)

  // 4) Auxiliary services revenue
  const auxEnergyKWh =
    powerKW * Math.max(auxHoursPerYear, 0) * Math.max(Math.min(auxUtilization, 1), 0)

  const annualAuxRevenueYuan = auxEnergyKWh * Math.max(auxPriceYuanPerKWh, 0)

  // 5) Other subsidies (already in ten-thousand RMB)
  const otherWan = Math.max(otherSubsidyWanPerYear, 0)

  // Convert all calculated revenues to ten-thousand RMB (万元)
  const spotWan = annualSpotRevenueYuan / 10000
  const capacityWan = annualCapacityRevenueYuan / 10000
  const leasingWan = annualLeasingRevenueYuan / 10000
  const auxWan = annualAuxRevenueYuan / 10000

  const totalWan = spotWan + capacityWan + leasingWan + auxWan + otherWan

  return {
    spotWan,
    capacityWan,
    leasingWan,
    auxWan,
    otherWan,
    totalWan,
  }
}

/**
 * QinghaiStorageCalculator
 * @description Main calculator component that renders input controls for system & policy parameters
 * and displays real-time computed annual revenues and breakdown.
 */
export const QinghaiStorageCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<StorageInputs>({
    // Project baseline: 300MW/1200MWh
    powerMW: 300,
    energyMWh: 1200,
    roundTripEfficiency: 0.86,
    capacityAvailability: 0.85,
    cyclesPerDay: 1,
    daysPerYear: 330,

    capexPerKWh: 1200,

    // Spot spread: use 0.50 as neutral, user can move towards 0.40~0.57
    spotSpreadYuanPerKWh: 0.5,

    // Capacity price: from征求意见稿
    capacityStandardYuanPerKWYear: 165,
    capacitySupplyDemandCoeff: 1.04,
    storagePlantUseRate: 0.1039,
    systemPeakDurationHours: 4,

    // Capacity leasing: neutral scenario in the report
    leasePriceYuanPerKWYear: 200,
    leaseRatio: 0.7,

    // Auxiliary services: based on 0.3247 元/kWh and conservative hours/利用率
    auxPriceYuanPerKWh: 0.3247,
    auxHoursPerYear: 200,
    auxUtilization: 0.06,

    // Other subsidies: default 0 for flexibility
    otherSubsidyWanPerYear: 0,
  })

  /**
   * Helper to update a single field in the inputs state.
   */
  const updateField = <K extends keyof StorageInputs>(key: K, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const revenues = useMemo(() => computeRevenues(inputs), [inputs])

  const powerKW = Math.max(inputs.powerMW, 0) * 1000
  const energyKWh = Math.max(inputs.energyMWh, 0) * 1000
  const durationHours = inputs.powerMW > 0 ? inputs.energyMWh / inputs.powerMW : 0
  const totalInvestmentYuan = energyKWh * Math.max(inputs.capexPerKWh, 0)
  const totalInvestmentYi = totalInvestmentYuan / 1e8

  const ratio = (part: number): number => {
    if (revenues.totalWan <= 0) return 0
    return (part / revenues.totalWan) * 100
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-6 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <Calculator className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2
              id="calculator-heading"
              className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
            >
              青海省独立储能 · 投资与收益测算模块
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              根据青海电力现货市场规则 V6.0、电价政策及容量补偿机制，调整系统参数和政策参数，
              实时查看项目总收益与各分项收益的变化，理解现货价差、容量电价、容量租赁和辅助服务之间的勾稽关系。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
          <LineChart className="h-4 w-4 text-sky-500" />
          <div className="space-y-0.5">
            <div className="font-medium text-slate-900">
              年总收益：{revenues.totalWan.toLocaleString(undefined, { maximumFractionDigits: 0 })} 万元
            </div>
            <div className="text-[11px] text-slate-500">
              折合约 {(revenues.totalWan / 10000).toFixed(2)} 亿元
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:gap-7 lg:px-8">
        {/* Left: inputs */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700">
            <div className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              参数设置
            </div>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
              单位：功率 MW · 容量 MWh · 金额 元/万元
            </span>
          </div>

          {/* Project parameters */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>项目参数</span>
              <span className="text-slate-9000">
                当前：{inputs.powerMW} MW / {inputs.energyMWh} MWh（{durationHours.toFixed(1)} h）
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <LabeledNumberInput
                label="装机功率"
                unit="MW"
                value={inputs.powerMW}
                min={1}
                step={10}
                onChange={(v) => updateField('powerMW', v)}
              />
              <LabeledNumberInput
                label="储能容量"
                unit="MWh"
                value={inputs.energyMWh}
                min={1}
                step={50}
                onChange={(v) => updateField('energyMWh', v)}
              />
              <LabeledNumberInput
                label="往返效率"
                unit="0-1"
                value={inputs.roundTripEfficiency}
                min={0.5}
                max={1}
                step={0.01}
                onChange={(v) => updateField('roundTripEfficiency', v)}
                helperText="示例：0.86"
              />
              <LabeledNumberInput
                label="容量可用率"
                unit="0-1"
                value={inputs.capacityAvailability}
                min={0.5}
                max={1}
                step={0.01}
                onChange={(v) => updateField('capacityAvailability', v)}
                helperText="考虑检修、故障等 · 示例：0.85"
              />
              <LabeledNumberInput
                label="日充放次数"
                unit="次/天"
                value={inputs.cyclesPerDay}
                min={0}
                max={2}
                step={0.1}
                onChange={(v) => updateField('cyclesPerDay', v)}
              />
              <LabeledNumberInput
                label="年运行天数"
                unit="天/年"
                value={inputs.daysPerYear}
                min={200}
                max={365}
                step={1}
                onChange={(v) => updateField('daysPerYear', v)}
              />
              <LabeledNumberInput
                label="综合投资单价"
                unit="元/kWh"
                value={inputs.capexPerKWh}
                min={400}
                max={1500}
                step={50}
                onChange={(v) => updateField('capexPerKWh', v)}
                helperText="仅用于显示总投资，暂不参与收益计算"
              />
            </div>
          </div>

          {/* Policy & market parameters */}
          <div className="space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="text-[11px] font-semibold text-slate-600">市场与政策参数</div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              {/* Spot spread */}
              <LabeledNumberInput
                label="现货价差"
                unit="元/kWh"
                value={inputs.spotSpreadYuanPerKWh}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateField('spotSpreadYuanPerKWh', v)}
                helperText="示例：0.40~0.57"
              />

              {/* Capacity price */}
              <LabeledNumberInput
                label="容量补偿标准"
                unit="元/kW·年"
                value={inputs.capacityStandardYuanPerKWYear}
                min={0}
                max={500}
                step={5}
                onChange={(v) => updateField('capacityStandardYuanPerKWYear', v)}
                helperText="征求意见稿：165"
              />
              <LabeledNumberInput
                label="容量供需系数"
                unit="无量纲"
                value={inputs.capacitySupplyDemandCoeff}
                min={0}
                max={2}
                step={0.01}
                onChange={(v) => updateField('capacitySupplyDemandCoeff', v)}
                helperText="示例：1.04"
              />
              <LabeledNumberInput
                label="储能厂用电率"
                unit="0-1"
                value={inputs.storagePlantUseRate}
                min={0}
                max={0.3}
                step={0.001}
                onChange={(v) => updateField('storagePlantUseRate', v)}
                helperText="示例：0.1039"
              />
              <LabeledNumberInput
                label="系统净负荷高峰时长"
                unit="小时"
                value={inputs.systemPeakDurationHours}
                min={1}
                max={8}
                step={0.5}
                onChange={(v) => updateField('systemPeakDurationHours', v)}
                helperText="示例：4"
              />

              {/* Capacity leasing */}
              <LabeledNumberInput
                label="容量租赁价格"
                unit="元/kW·年"
                value={inputs.leasePriceYuanPerKWYear}
                min={0}
                max={400}
                step={10}
                onChange={(v) => updateField('leasePriceYuanPerKWYear', v)}
                helperText="示例：100/200/300"
              />
              <LabeledNumberInput
                label="出租比例"
                unit="0-1"
                value={inputs.leaseRatio}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateField('leaseRatio', v)}
                helperText="装机容量中可出租部分比例"
              />

              {/* Auxiliary service */}
              <LabeledNumberInput
                label="辅助服务价格"
                unit="元/kWh"
                value={inputs.auxPriceYuanPerKWh}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateField('auxPriceYuanPerKWh', v)}
                helperText="西北监能市场[2025]48号：0.3247"
              />
              <LabeledNumberInput
                label="年调用小时数"
                unit="小时/年"
                value={inputs.auxHoursPerYear}
                min={0}
                max={2000}
                step={10}
                onChange={(v) => updateField('auxHoursPerYear', v)}
              />
              <LabeledNumberInput
                label="调用利用率"
                unit="0-1"
                value={inputs.auxUtilization}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => updateField('auxUtilization', v)}
                helperText="调用时段内平均负荷占比"
              />

              {/* Other subsidy */}
              <LabeledNumberInput
                label="其他补贴"
                unit="万元/年"
                value={inputs.otherSubsidyWanPerYear}
                min={0}
                step={10}
                onChange={(v) => updateField('otherSubsidyWanPerYear', v)}
                helperText="如地方补贴、容量奖补等"
              />
            </div>
          </div>
        </div>

        {/* Right: computed results */}
        <div className="flex-1 space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              结果总览
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500">
              根据当前参数计算项目年度收益。金额单位为万元，如需与投资对比可参考右侧投资规模。
            </p>
          </div>

          {/* Key derived metrics */}
          <dl className="grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-3">
            <div className="space-y-1 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <dt className="text-[11px] font-medium text-slate-500">储能时长</dt>
              <dd className="text-sm font-semibold">{durationHours.toFixed(2)} 小时</dd>
            </div>
            <div className="space-y-1 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <dt className="text-[11px] font-medium text-slate-500">装机 / 有效容量</dt>
              <dd className="text-sm font-semibold">
                {powerKW.toLocaleString()} /{' '}
                {(
                  powerKW *
                  (1 - Math.max(Math.min(inputs.storagePlantUseRate, 0.5), 0)) *
                  (inputs.systemPeakDurationHours > 0
                    ? Math.min(durationHours / inputs.systemPeakDurationHours, 1)
                    : 0)
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
                kW
              </dd>
            </div>
            <div className="space-y-1 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <dt className="text-[11px] font-medium text-slate-500">项目总投资</dt>
              <dd className="text-sm font-semibold">
                {totalInvestmentYi.toFixed(2)} 亿元
              </dd>
            </div>
          </dl>

          {/* Revenue breakdown list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              年度收益分项（万元）
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                <span className="font-medium text-slate-900">总收益</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {revenues.totalWan.toLocaleString(undefined, { maximumFractionDigits: 0 })} 万元
                  <span className="ml-1 text-[11px] text-slate-500">
                    （{(revenues.totalWan / 10000).toFixed(2)} 亿元）
                  </span>
                </span>
              </div>

              <div className="space-y-1.5 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <BreakdownRow
                  label="现货交易收益"
                  valueWan={revenues.spotWan}
                  colorClass="bg-emerald-500"
                  ratio={ratio(revenues.spotWan)}
                />
                <BreakdownRow
                  label="容量电价（容量补偿）"
                  valueWan={revenues.capacityWan}
                  colorClass="bg-sky-500"
                  ratio={ratio(revenues.capacityWan)}
                />
                <BreakdownRow
                  label="容量租赁收益"
                  valueWan={revenues.leasingWan}
                  colorClass="bg-amber-500"
                  ratio={ratio(revenues.leasingWan)}
                />
                <BreakdownRow
                  label="辅助服务收益"
                  valueWan={revenues.auxWan}
                  colorClass="bg-purple-500"
                  ratio={ratio(revenues.auxWan)}
                />
                <BreakdownRow
                  label="其他补贴"
                  valueWan={revenues.otherWan}
                  colorClass="bg-pink-500"
                  ratio={ratio(revenues.otherWan)}
                />
              </div>
            </div>
          </div>

          {/* Simple textual hints */}
          <div className="mt-1 space-y-1 text-[11px] leading-relaxed text-slate-500">
            <p>
              提示：可通过提高现货价差、容量补偿标准或降低厂用电率来观察容量补偿收益的变化；
              通过调整租赁价格与出租比例评估容量租赁对整体收益的贡献。
            </p>
            <p>
              若需进一步加入折旧、运维成本、IRR/NPV 等指标，可在当前模块基础上叠加成本与现金流计算。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * BreakdownRowProps
 * @description Props for a single revenue breakdown row with a mini bar.
 */
interface BreakdownRowProps {
  label: string
  valueWan: number
  colorClass: string
  ratio: number
}

/**
 * BreakdownRow
 * @description Displays one revenue item with its absolute value and percentage bar.
 */
const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, valueWan, colorClass, ratio }) => {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">
          {valueWan.toLocaleString(undefined, { maximumFractionDigits: 0 })} 万元
          <span className="ml-1 text-[11px] text-slate-500">
            {safeRatio > 0 ? `${safeRatio.toFixed(1)}%` : '0%'}
          </span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.max(safeRatio, 1)}%` }}
        />
      </div>
    </div>
  )
}
