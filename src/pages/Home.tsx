/**
 * @file Home.tsx
 * @description Home page for "易储能源 | 青海省独立储能专栏网站", assembling the project showcase
 * and the interactive investment & revenue calculator for Qinghai independent storage projects.
 */

import React from 'react'
import { SiteHeader } from '../components/layout/SiteHeader'
import { QinghaiProjectOverview } from '../components/storage/QinghaiProjectOverview'
import { QinghaiStorageCalculator } from '../components/storage/QinghaiStorageCalculator'

/**
 * Home
 * @description Renders the main layout with the 300MW/1200MWh project overview
 * and the interactive investment and revenue calculator module.
 */
const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-6 lg:px-6">
        {/* 300MW/1200MWh project static overview */}
        <section aria-labelledby="project-overview-heading">
          <QinghaiProjectOverview />
        </section>

        {/* Interactive calculator for arbitrary Qinghai storage projects */}
        <section aria-labelledby="calculator-heading">
          <QinghaiStorageCalculator />
        </section>
      </main>
    </div>
  )
}

export default Home
