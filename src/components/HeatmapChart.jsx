import { useMemo } from "react"

const FALLBACK_GRID_SIZE = 20
const MIN_VALUE = -0.5
const MAX_VALUE = 0.5

function createFallbackLabels() {
  return Array.from({ length: FALLBACK_GRID_SIZE }, (_, index) => index + 1)
}

function getSweepLabels(values) {
  return Array.isArray(values) && values.length > 0 ? values : createFallbackLabels()
}

function formatAxisLabel(value) {
  const numericValue = Number(value)

  return Number.isFinite(numericValue) ? numericValue.toLocaleString() : value
}

function createRandomCells(xLabels, yLabels) {
  return yLabels.flatMap((yLabel, rowIndex) =>
    xLabels.map((xLabel, columnIndex) => ({
      id: `${rowIndex}-${columnIndex}`,
      xLabel,
      yLabel,
      value: Math.random() * (MAX_VALUE - MIN_VALUE) + MIN_VALUE,
    })),
  )
}

function getCellColor(value) {
  const clampedValue = Math.min(Math.max(value, MIN_VALUE), MAX_VALUE)
  const intensity = Math.abs(clampedValue) / MAX_VALUE
  const lightness = 96 - intensity * 46

  if (clampedValue < 0) {
    return `hsl(0 72% ${lightness}%)`
  }

  return `hsl(142 64% ${lightness}%)`
}

export default function HeatmapChart({ data }) {
  const xLabels = getSweepLabels(data?.stopLossSweepArray)
  const yLabels = getSweepLabels(
    data?.takeProfitSweepArray ?? data?.stopLossSweepArray,
  )
  const displayYLabels = [...yLabels].reverse()
  const xLabelsKey = xLabels.join("|")
  const yLabelsKey = displayYLabels.join("|")
  const cells = useMemo(
    () => createRandomCells(xLabels, displayYLabels),
    [xLabelsKey, yLabelsKey],
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid min-h-0 flex-1 grid-cols-[1px_32px_1fr] grid-rows-[1fr_min-content_20px] gap-1">
        <div className="col-start-1 row-start-1 flex items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase text-stone-400">
            TP - {data?.takeProfitSweepUnit ?? "Y"}
          </span>
        </div>

        <div
          className="col-start-2 row-start-1 grid gap-px"
          style={{
            gridTemplateRows: `repeat(${displayYLabels.length}, minmax(0, 1fr))`,
          }}
        >
          {displayYLabels.map((label) => (
            <div
              key={label}
              className="flex items-center justify-end overflow-hidden pr-1 text-[8px] font-semibold leading-none text-stone-500"
              title={String(label)}
            >
              {formatAxisLabel(label)}
            </div>
          ))}
        </div>

        <div
          className="col-start-3 row-start-1 grid min-h-0"
          style={{
            gridTemplateColumns: `repeat(${xLabels.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${displayYLabels.length}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => (
            <button
              key={cell.id}
              type="button"
              className="min-h-0 min-w-0 transition hover:z-10 hover:scale-125 hover:border border-black hover:rounded-sm"
              style={{ backgroundColor: getCellColor(cell.value) }}
              title={`${data?.stopLossSweepUnit ?? "X"}: ${cell.xLabel}, ${data?.takeProfitSweepUnit ?? "Y"}: ${cell.yLabel}, Value: ${cell.value.toFixed(3)}`}
            />
          ))}
        </div>

        <div className="col-start-3 row-start-2 grid gap-px">
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${xLabels.length}, minmax(0, 1fr))`,
            }}
          >
            {xLabels.map((label) => (
              <div
                key={label}
                className="overflow-hidden text-center text-[8px] font-semibold leading-none text-stone-500"
                title={String(label)}
              >
                {formatAxisLabel(label)}
              </div>
            ))}
          </div>
        </div>

        <div className="col-start-3 row-start-3 flex items-center justify-center text-[10px] font-bold uppercase text-stone-400">
          SL - {data?.stopLossSweepUnit ?? "X"}
        </div>
      </div>
    </div>
  )
}
