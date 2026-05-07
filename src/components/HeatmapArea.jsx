import { useState } from "react"

import WinRateDonut from "./WinRateDonut"
import HeatmapChart from "./HeatmapChart"

export default function HeatmapArea({ data }) {
  const [heatmapMode, setHeatmapMode] = useState("Agregate")

  const longHeight =
    data?.numberOfLongs > data?.numberOfShorts
      ? "100%"
      : `${((data?.numberOfLongs ?? 0) / (data?.numberOfShorts || 1)) * 100}%`

  const shortHeight =
    data?.numberOfShorts > data?.numberOfLongs
      ? "100%"
      : `${((data?.numberOfShorts ?? 0) / (data?.numberOfLongs || 1)) * 100}%`

  return (
    <div className="grid grid-cols-[4fr_1fr] gap-4">
      <div className="card h-[70vh]">
        <div className="flex font-bold ">
          Expetancy Heatmap
          <div className="flex ml-auto text-stone-200 border border-stone-500 rounded-md text-[9px] overflow-hidden">
            <button
              className={`hover:bg-stone-700 px-3 border-r border-stone-500 ${heatmapMode === "Monthly" ? "bg-blue-700/40" : ""}`}
              onClick={() => setHeatmapMode("Monthly")}
            >
              Monthly
            </button>
            <button
              className={`hover:bg-stone-700 px-3 border-r border-stone-500 ${heatmapMode === "Yearly" ? "bg-blue-700/40" : ""}`}
              onClick={() => setHeatmapMode("Yearly")}
            >
              Yearly
            </button>
            <button
              className={`hover:bg-stone-700 px-3 ${heatmapMode === "Agregate" ? "bg-blue-700/40" : ""}`}
              onClick={() => setHeatmapMode("Agregate")}
            >
              Agregate
            </button>
          </div>
        </div>
        <HeatmapChart data={data} />
      </div>
      <div>
        <div className="card">
          <span className="font-bold">Selected Cell Preview</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-around h-full bg-stone-900 rounded-md p-3 text-stone-400 text-[9px]">
              <div className="flex flex-col items-center">
                <div
                  className="w-4 bg-blue-700 mt-auto rounded-sm"
                  style={{ height: longHeight }}
                ></div>
                <span>{data?.numberOfLongs ?? "Loading..."} Longs</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-4 bg-blue-700 mt-auto rounded-sm"
                  style={{ height: shortHeight }}
                ></div>
                <span>{data?.numberOfShorts ?? "Loading..."} Shorts</span>
              </div>
            </div>
            <div className="flex flex-col bg-stone-900 rounded-md p-3">
              <WinRateDonut winRate={data?.winRate} />
            </div>
          </div>
          <div>
            <div className="flex justify-between my-6">
              <div className="flex flex-col gap-3 text-xs text-stone-400">
                <span>Total Return</span>
                <span># of Trades</span>
                <span># of Trades Skipped</span>
                <span># of Days Tested</span>
                <span>Total Expetancy</span>
                <span>Yearly Expetancy</span>
                <span>Monthly Expetancy</span>
                <span>Max DD</span>
                <span>Avg DD</span>
                <span>Sharpe Ratio</span>
                <span>Sortino Ratio</span>
              </div>
              <div className="flex flex-col gap-3 font-bold text-xs mr-4">
                <div className="px-2 bg-blue-700/50 rounded-full">
                  {data?.numberOfTrades}
                </div>
              </div>
            </div>

            <div className="bg-stone-900 rounded-lg p-4 shadow-md">
              Mini equity chart
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
