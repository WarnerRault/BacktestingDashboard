const SIZE = 100
const STROKE_WIDTH = 8
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function normalizeWinRate(winRate) {
  const numericWinRate = Number(winRate)

  if (!Number.isFinite(numericWinRate)) {
    return null
  }

  const percentage = numericWinRate <= 1 ? numericWinRate * 100 : numericWinRate

  return Math.min(Math.max(percentage, 0), 100)
}

export default function WinRateDonut({ winRate }) {
  const percentage = normalizeWinRate(winRate)
  const strokeOffset =
    percentage === null
      ? CIRCUMFERENCE
      : CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE
  const label = percentage === null ? "--" : `${percentage.toFixed(0)}%`

  return (
    <div className="relative grid h-20 w-full place-items-center text-stone-100">
      <svg
        className="h-20 w-20 -rotate-90"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Win rate ${label}`}
      >
        <circle
          className="stroke-red-500"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          className="stroke-emerald-500"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-lg font-bold">{label}</span>
        <span className="text-[9px] font-semibold uppercase text-stone-400">
          Win Rate
        </span>
      </div>
    </div>
  )
}
