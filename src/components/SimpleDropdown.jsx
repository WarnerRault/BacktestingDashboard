import { useEffect, useRef, useState } from "react"

import CheckIcon from "../icons/check.svg?react"
import ChevronIcon from "../icons/chevron-down.svg?react"

export default function SimpleDropdown({ options, value, onChange, className = "" }) {
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-xs font-semibold text-stone-100 hover:bg-stone-700"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
        <ChevronIcon className="h-3 w-3 shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded border border-stone-600 bg-stone-900 shadow-lg">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className="flex w-full items-center justify-between gap-2 px-2 py-1 text-left text-xs font-semibold text-stone-100 hover:bg-stone-700"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
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
