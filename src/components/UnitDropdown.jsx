import { useEffect, useRef, useState } from "react"

import CheckIcon from "../icons/check.svg?react"
import ChevronIcon from "../icons/chevron-down.svg?react"

const UNIT_OPTIONS = [
  { value: "$", label: "$" },
  { value: "%", label: "%" },
  { value: "R", label: "R" },
]

export default function UnitDropdown({ value, onChange }) {
  const unitRef = useRef(null)
  const [unitDropdown, setUnitDropdown] = useState(false)

  useEffect(() => {
    function closeDropdownOnOutsideClick(event) {
      if (!unitRef.current?.contains(event.target)) {
        setUnitDropdown(false)
      }
    }

    document.addEventListener("pointerdown", closeDropdownOnOutsideClick)

    return () => {
      document.removeEventListener("pointerdown", closeDropdownOnOutsideClick)
    }
  }, [])

  return (
    <div className="relative" ref={unitRef}>
      <button
        type="button"
        className="flex items-center gap-2 border border-stone-500 p-0.5 px-3 rounded-md text-sm text-stone-200 hover:bg-stone-800"
        onClick={() => setUnitDropdown(!unitDropdown)}
      >
        {value}
        <ChevronIcon className="h-3 w-3 ml-4" />
      </button>
      {unitDropdown && (
        <div className="absolute flex flex-col gap-2 top-full right-0 mt-2 w-32 p-3 text-sm bg-stone-800 border border-stone-500 rounded-md shadow-lg">
          {UNIT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className="flex items-center justify-between gap-2 text-left text-stone-200 hover:text-white"
              onClick={() => {
                onChange(option.value)
                setUnitDropdown(false)
              }}
            >
              {option.label}
              {option.value === value && <CheckIcon className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
