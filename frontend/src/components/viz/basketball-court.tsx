interface Shot {
  locX: number
  locY: number
  shotMade: boolean
}

interface BasketballCourtProps {
  shots?: Shot[]
  shotRadius?: number
  showMadeShots?: boolean
  showMissedShots?: boolean
}

function BasketballCourt({
  shots = [],
  shotRadius = 0.4,
  showMadeShots = true,
  showMissedShots = true,
}: BasketballCourtProps) {
  const SCALE = 1
  const RADIUS_3PT = 23.75 * SCALE
  const STRAIGHT_X = 22 * SCALE
  const STRAIGHT_Y = 14.2 * SCALE
  const BASKET_DIST = 5.25 * SCALE
  const BASKET_RADIUS = 0.75 * SCALE
  const BB_DIST = 4 * SCALE
  const KEY_WIDTH = 8 * SCALE
  const FT_LINE_Y = 19 * SCALE
  const BASKET_WIDTH = 3 * SCALE
  const FT_CIRCLE_RADIUS = 6 * SCALE
  const FT_CIRCLE_DIST = 19 * SCALE
  const COURT_Y = 50 * SCALE
  const COURT_X = 50 * SCALE
  const lineClassName = "stroke-primary"
  function generateArc(
    radius: number,
    startAngle: number,
    endAngle: number,
    centerX: number,
    centerY: number,
    sweepFlag: number = 0,
  ) {
    const start = {
      x: centerX + radius * Math.cos(startAngle),
      y: centerY + radius * Math.sin(startAngle),
    }
    const end = {
      x: centerX + radius * Math.cos(endAngle),
      y: centerY + radius * Math.sin(endAngle),
    }

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
  }

  const startAngle = Math.acos(STRAIGHT_X / RADIUS_3PT)
  const threePointArc = generateArc(
    RADIUS_3PT,
    -startAngle,
    -Math.PI + startAngle,
    0,
    COURT_Y - BASKET_DIST,
  )

  const ftCircleTop = generateArc(
    FT_CIRCLE_RADIUS,
    0,
    Math.PI,
    0,
    COURT_Y - FT_CIRCLE_DIST,
  )

  const ftCircleBottom = generateArc(
    FT_CIRCLE_RADIUS,
    Math.PI,
    2 * Math.PI,
    0,
    COURT_Y - FT_CIRCLE_DIST,
  )

  return (
    <svg
      viewBox={`${-25 * SCALE} 0 ${COURT_X} ${COURT_Y}`}
      className="h-full w-full"
    >
      <line
        className={lineClassName}
        x1={-25 * SCALE}
        y1={COURT_Y}
        x2={25 * SCALE}
        y2={COURT_Y}
        stroke="red"
        strokeWidth="0.25"
      />
      {/* full court lines if i ever need them */}

      <line
        className={lineClassName}
        x1={-25 * SCALE}
        y1={0}
        x2={25 * SCALE}
        y2={0}
        stroke="red"
        strokeWidth="0.25"
      />
      <line
        className={lineClassName}
        x1={25 * SCALE}
        y1={0}
        x2={25 * SCALE}
        y2={COURT_Y}
        stroke="red"
        strokeWidth="0.25"
      />
      <line
        className={lineClassName}
        x1={-25 * SCALE}
        y1={0}
        x2={-25 * SCALE}
        y2={COURT_Y}
        stroke="red"
        strokeWidth="0.25"
      />
      {/* Three point line */}
      <path
        d={threePointArc}
        className={lineClassName}
        fill="none"
        stroke="red"
        strokeWidth="0.1"
      />
      <line
        className={lineClassName}
        x1={-STRAIGHT_X}
        y1={COURT_Y}
        x2={-STRAIGHT_X}
        y2={COURT_Y - STRAIGHT_Y}
        stroke="red"
        strokeWidth="0.1"
      />
      <line
        className={lineClassName}
        x1={STRAIGHT_X}
        y1={COURT_Y}
        x2={STRAIGHT_X}
        y2={COURT_Y - STRAIGHT_Y}
        stroke="red"
        strokeWidth="0.1"
      />

      {/* Key box */}
      <line
        className={lineClassName}
        x1={-KEY_WIDTH}
        y1={COURT_Y}
        x2={-KEY_WIDTH}
        y2={COURT_Y - FT_LINE_Y}
        stroke="red"
        strokeWidth="0.1"
      />
      <line
        className={lineClassName}
        x1={KEY_WIDTH}
        y1={COURT_Y}
        x2={KEY_WIDTH}
        y2={COURT_Y - FT_LINE_Y}
        stroke="red"
        strokeWidth="0.1"
      />
      <line
        className={lineClassName}
        x1={-KEY_WIDTH}
        y1={COURT_Y - FT_LINE_Y}
        x2={KEY_WIDTH}
        y2={COURT_Y - FT_LINE_Y}
        stroke="red"
        strokeWidth="0.1"
      />

      {/* <line
        x1={-COURT_X}
        y1={COURT_Y - BB_DIST}
        x2={COURT_X}
        y2={COURT_Y - BB_DIST}
        stroke="red"
        strokeWidth="0.1"
        strokeDasharray="2,2"
        opacity={0.5}
      />

      <line
        x1={-COURT_X}
        y1={COURT_Y - BASKET_DIST}
        x2={COURT_X}
        y2={COURT_Y - BASKET_DIST}
        stroke="red"
        strokeWidth="0.1"
        strokeDasharray="2,2"
        opacity={0.5}
      />

      <line
        x1={-COURT_X}
        y1={COURT_Y - STRAIGHT_Y}
        x2={COURT_X}
        y2={COURT_Y - STRAIGHT_Y}
        stroke="red"
        strokeWidth="0.1"
        strokeDasharray="2,2"
        opacity={0.5}
      />

      <line
        x1={-COURT_X}
        y1={COURT_Y - 29}
        x2={COURT_X}
        y2={COURT_Y - 29}
        stroke="red"
        strokeWidth="0.1"
        strokeDasharray="2,2"
        opacity={0.5}
      /> */}

      {/* <line
        x1={-COURT_X}
        y1={COURT_Y - COURT_Y / 2}
        x2={COURT_X}
        y2={COURT_Y - COURT_Y / 2}
        stroke="red"
        strokeWidth="0.1"
      /> */}

      {/* Basket */}
      <line
        className={lineClassName}
        x1={-BASKET_WIDTH}
        y1={COURT_Y - BB_DIST}
        x2={BASKET_WIDTH}
        y2={COURT_Y - BB_DIST}
        stroke="red"
        strokeWidth="0.1"
      />

      {/* Hoop */}
      <circle
        className={lineClassName}
        cx={0}
        cy={COURT_Y - BASKET_DIST}
        r={BASKET_RADIUS}
        fill="none"
        stroke="red"
        strokeWidth="0.1"
      />

      {/* Free throw circle */}
      <path
        d={ftCircleTop}
        className={lineClassName}
        fill="none"
        stroke="red"
        strokeWidth="0.1"
      />
      <path
        className={lineClassName}
        d={ftCircleBottom}
        fill="none"
        stroke="red"
        strokeWidth="0.1"
        strokeDasharray="2,2"
      />

      {shots.map((shot, index) => {
        if (
          (!shot.shotMade && !showMissedShots) ||
          (shot.shotMade && !showMadeShots)
        ) {
          return null
        }
        return (
          <circle
            key={index}
            cx={shot.locX * SCALE}
            cy={COURT_Y - shot.locY * SCALE}
            r={shotRadius}
            fill={shot.shotMade ? "green" : "red"}
            opacity={0.5}
          />
        )
      })}
    </svg>
  )
}

export default BasketballCourt
