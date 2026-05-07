import ChevronIcon from "../icons/chevron-down.svg?react"
import FilterIcon from "../icons/filter.svg?react"
import CheckIcon from "../icons/check.svg?react"
import SimpleDropdown from "./SimpleDropdown.jsx"
import UnitDropdown from "./UnitDropdown.jsx"

import { useEffect, useRef, useState } from "react"

export default function TopBar({ data }) {
  const [unitMode, setUnitMode] = useState("$")
  const filterRef = useRef(null)
  const [filterDropdown, setFilterDropdown] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    intradayMultiday: false,
    intradayMultidayMode: "intraday",
    side: false,
    sideMode: "Long",
  })
  const loadingText = "Loading..."
  const formatPercent = (value) =>
    Number.isFinite(value) ? `${(value * 100).toLocaleString()}%` : loadingText
  const formatBps = (value) =>
    Number.isFinite(value)
      ? `${(value * 10000).toLocaleString()} bps`
      : loadingText
  const formatCurrency = (value) =>
    Number.isFinite(value) ? `$${value.toLocaleString()}` : loadingText
  const formatR = (value, mode) => {
    const numericValue = Number(value)

    if (!Number.isFinite(numericValue)) {
      return loadingText
    }

    if (mode === "percent") {
      const percentValue = numericValue <= 1 ? numericValue * 100 : numericValue
      return `${percentValue.toLocaleString()}%`
    }

    return formatCurrency(numericValue)
  }

  function toggleFilter(filterName) {
    setActiveFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: !currentFilters[filterName],
    }))
  }

  function setFilterValue(filterName, value) {
    setActiveFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }))
  }

  useEffect(() => {
    function closeDropdownOnOutsideClick(event) {
      if (!filterRef.current?.contains(event.target)) {
        setFilterDropdown(false)
      }
    }

    document.addEventListener("pointerdown", closeDropdownOnOutsideClick)

    return () => {
      document.removeEventListener("pointerdown", closeDropdownOnOutsideClick)
    }
  }, [])

  return (
    <div className="absolute flex items-center gap-4 top-0 left-0 bg-stone-950 w-full px-[12vw] p-2">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center font-bold">
          <span className="font-bold text-white">
            {data?.pair ?? "Loading..."}
          </span>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            {data?.timeFrame ?? "X"}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            Entry Fee: {formatPercent(data?.entryFee)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            TP Fee: {formatPercent(data?.tpFee)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            SL Fee: {formatPercent(data?.slFee)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            Slippage: {formatBps(data?.slippage)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            Starting Capital: {formatCurrency(data?.startingCapital)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            R: {formatR(data?.R, data?.rMode)}
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            Fee Cutoff: {formatPercent(data?.feeCutoff)} of R
          </div>
          <div className="border border-stone-500 h-min p-0.5 px-1 rounded-md text-[9px]">
            {data?.startDate
              ? new Date(data.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Loading..."}{" "}
            -{" "}
            {data?.endDate
              ? new Date(data.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Loading..."}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold">
          <div>{Math.trunc(data?.testTime, 0) ?? "Loading..."} Seconds</div>
          <div className="h-1 w-1 bg-stone-400 rounded-full"></div>
          <div>
            {data?.numberOfSystems?.toLocaleString() ?? "Loading..."} Systems
          </div>
          <div className="h-1 w-1 bg-stone-400 rounded-full"></div>
          <div>
            {data?.numberOfTradesTotal?.toLocaleString() ?? "Loading..."} Trades
          </div>
          <div className="h-1 w-1 bg-stone-400 rounded-full"></div>
          <div>{data?.timeStamp ?? "Loading..."}</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <UnitDropdown value={unitMode} onChange={setUnitMode} />
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            className="flex items-center gap-2 border border-stone-500 p-0.5 px-3 rounded-md text-sm text-stone-200 hover:bg-stone-800"
            onClick={() => setFilterDropdown(!filterDropdown)}
          >
            <FilterIcon className="h-3 w-3" />
            Filters
            <ChevronIcon className="h-3 w-3 ml-4" />
          </button>
          {filterDropdown && (
            <div className="absolute flex flex-col gap-2 top-full right-0 mt-2 w-48 p-3 text-sm bg-stone-800 border border-stone-500 rounded-md shadow-lg">
              <div className="flex flex-col">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left"
                  onClick={() => {
                    toggleFilter("intradayMultiday")
                  }}
                >
                  <div
                    className={`checkbox grid place-items-center ${
                      activeFilters.intradayMultiday
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-stone-500"
                    }`}
                  >
                    {activeFilters.intradayMultiday && (
                      <CheckIcon className="h-3 w-3" />
                    )}
                  </div>
                  Intraday/Multiday
                </button>
                {activeFilters.intradayMultiday && (
                  <div className="border-b border-stone-500 p-3">
                    <SimpleDropdown
                      value={activeFilters.intradayMultidayMode}
                      onChange={(value) =>
                        setFilterValue("intradayMultidayMode", value)
                      }
                      options={[
                        { value: "intraday", label: "Intraday" },
                        { value: "multiday", label: "Multi Day" },
                      ]}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left"
                  onClick={() => {
                    toggleFilter("side")
                  }}
                >
                  <div
                    className={`checkbox grid place-items-center ${
                      activeFilters.side
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-stone-500"
                    }`}
                  >
                    {activeFilters.side && <CheckIcon className="h-3 w-3" />}
                  </div>
                  Side
                </button>
                {activeFilters.side && (
                  <div className="border-b border-stone-500 p-3">
                    <SimpleDropdown
                      value={activeFilters.sideMode}
                      onChange={(value) => setFilterValue("sideMode", value)}
                      options={[
                        { value: "long", label: "Long" },
                        { value: "short", label: "Short" },
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
