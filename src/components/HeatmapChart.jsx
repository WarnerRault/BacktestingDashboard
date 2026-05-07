import { useMemo, useRef, useState } from "react"

const FALLBACK_GRID_SIZE = 20
const MIN_VALUE = -0.5
const MAX_VALUE = 0.5
const NEGATIVE_COLOR = [239, 68, 68]
const ZERO_COLOR = [255, 255, 255]
const POSITIVE_COLOR = [16, 185, 129]

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
  const color = clampedValue < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR
  const [red, green, blue] = ZERO_COLOR.map((channel, index) =>
    Math.round(channel + (color[index] - channel) * intensity),
  )

  return `rgb(${red} ${green} ${blue})`
}

function getBestCellId(cells) {
  if (cells.length === 0) {
    return null
  }

  return cells.reduce((bestCell, cell) =>
    cell.value > bestCell.value ? cell : bestCell,
  ).id
}

export default function HeatmapChart({ data }) {
  const chartRef = useRef(null)
  const [hoverMenu, setHoverMenu] = useState(null)
  const [selectedCellId, setSelectedCellId] = useState(null)
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
  const bestCellId = getBestCellId(cells)

  function openHoverMenu(cell, event) {
    const chartRect = chartRef.current?.getBoundingClientRect()
    const cellRect = event.currentTarget.getBoundingClientRect()

    if (!chartRect) {
      return
    }

    const menuHalfWidth = 88
    const rawX = cellRect.left - chartRect.left + cellRect.width / 2
    const maxX = Math.max(menuHalfWidth, chartRect.width - menuHalfWidth)
    const x = Math.min(Math.max(rawX, menuHalfWidth), maxX)
    const cellTop = cellRect.top - chartRect.top
    const placeBelow = cellTop < 78

    setHoverMenu({
      cell,
      x,
      y: placeBelow ? cellRect.bottom - chartRect.top : cellTop,
      placement: placeBelow ? "bottom" : "top",
    })
  }

  function closeHoverMenu() {
    setHoverMenu(null)
  }

  return (
    <div ref={chartRef} className="relative flex h-full min-h-0 flex-col gap-3">
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
          {cells.map((cell) => {
            const isBestCell = cell.id === bestCellId
            const isSelectedCell = cell.id === selectedCellId

            return (
              <button
                key={cell.id}
                type="button"
                className={`relative min-h-0 min-w-0 transition hover:z-20 hover:scale-125 hover:rounded-sm hover:border border-black ${
                  isBestCell || isSelectedCell ? "z-10 border" : ""
                }`}
                style={{ backgroundColor: getCellColor(cell.value) }}
                aria-label={`${data?.stopLossSweepUnit ?? "X"}: ${cell.xLabel}, ${data?.takeProfitSweepUnit ?? "Y"}: ${cell.yLabel}, Value: ${cell.value.toFixed(3)}`}
                aria-pressed={isSelectedCell}
                onClick={() => setSelectedCellId(cell.id)}
                onBlur={closeHoverMenu}
                onFocus={(event) => openHoverMenu(cell, event)}
                onPointerEnter={(event) => openHoverMenu(cell, event)}
                onPointerLeave={closeHoverMenu}
              >
                {isSelectedCell && (
                  <span className="pointer-events-none absolute inset-0 z-10 ring-2 ring-inset ring-yellow-500 shadow-[inset_0_0_0_1px_rgba(12,74,110,0.9)]" />
                )}
                {isBestCell && (
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2 rounded-full border border-yellow-500 bg-stone-950 px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none text-white shadow-md">
                    Best
                  </span>
                )}
              </button>
            )
          })}
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

      {hoverMenu && (
        <div
          className="pointer-events-none absolute z-50 w-44 rounded-md border border-stone-600 bg-stone-950/95 p-2 text-[10px] text-stone-100 shadow-2xl backdrop-blur"
          style={{
            left: hoverMenu.x,
            top: hoverMenu.y,
            transform:
              hoverMenu.placement === "bottom"
                ? "translate(-50%, 10px)"
                : "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <span
            className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-stone-600 bg-stone-950 ${
              hoverMenu.placement === "bottom"
                ? "-top-1 border-l border-t"
                : "-bottom-1 border-b border-r"
            }`}
          />
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wide text-stone-300">
              Cell Details
            </span>
            {hoverMenu.cell.id === bestCellId && (
              <span className="rounded-full bg-green-500/20 px-1.5 py-0.5 font-bold uppercase text-green-200">
                Best
              </span>
            )}
            {hoverMenu.cell.id === selectedCellId && (
              <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 font-bold uppercase text-sky-200">
                Selected
              </span>
            )}
          </div>
          <div className="space-y-1 text-stone-300">
            <div className="flex items-center justify-between gap-3">
              <span>{data?.stopLossSweepUnit ?? "SL"}</span>
              <span className="font-bold text-white">
                {formatAxisLabel(hoverMenu.cell.xLabel)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>{data?.takeProfitSweepUnit ?? "TP"}</span>
              <span className="font-bold text-white">
                {formatAxisLabel(hoverMenu.cell.yLabel)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-700 pt-1">
              <span>Value</span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getCellColor(hoverMenu.cell.value) }}
                />
                {hoverMenu.cell.value.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
