import React, { useEffect, useRef } from "react"

interface Shot {
  locX: number
  locY: number
  shotMade: boolean
}

interface BasketballCourtProps {
  shots?: Shot[]
  shotRadius?: number
  width?: number
  height?: number
}

export const BasketballCourtCanvas = React.forwardRef<
  HTMLCanvasElement,
  BasketballCourtProps
>(({ shots = [], shotRadius = 0.4, width = 784, height = 784 }, ref) => {
  const [canvasWidth, setCanvasWidth] = React.useState(width)
  const [canvasHeight, setCanvasHeight] = React.useState(height)
  const [canvasScale, setCanvasScale] = React.useState(13.35)
  const localCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef =
    (ref as React.RefObject<HTMLCanvasElement>) || localCanvasRef

  const SCALE = canvasScale
  const RADIUS_3PT = 23.75 * canvasScale
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

  const drawArc = (
    ctx: CanvasRenderingContext2D,
    radius: number,
    endAngle: number,
    startAngle: number,
    centerX: number,
    centerY: number,
  ) => {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.stroke()
  }

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    ctx.lineWidth = 1.5

    ctx.translate(canvasWidth / 2, 1) // Transform to match SVG coordinate system
    ctx.scale(1, 1)

    ctx.beginPath() // Baseline
    ctx.moveTo(-25 * SCALE, COURT_Y)
    ctx.lineTo(25 * SCALE, COURT_Y)
    ctx.stroke()

    ctx.beginPath() // Half Court Line
    ctx.moveTo(-25 * SCALE, 0)
    ctx.lineTo(25 * SCALE, 0)
    ctx.stroke()

    ctx.beginPath() // Sidelines
    ctx.moveTo(-25 * SCALE, 0)
    ctx.lineTo(-25 * SCALE, COURT_Y)
    ctx.moveTo(25 * SCALE, 0)
    ctx.lineTo(25 * SCALE, COURT_Y)
    ctx.stroke()

    const startAngle = Math.acos(STRAIGHT_X / RADIUS_3PT) // Three point line
    ctx.beginPath()
    drawArc(
      ctx,
      RADIUS_3PT,
      -startAngle,
      -Math.PI + startAngle,
      0,
      COURT_Y - BASKET_DIST,
    )
    ctx.moveTo(-STRAIGHT_X, COURT_Y)
    ctx.lineTo(-STRAIGHT_X, COURT_Y - STRAIGHT_Y)
    ctx.moveTo(STRAIGHT_X, COURT_Y)
    ctx.lineTo(STRAIGHT_X, COURT_Y - STRAIGHT_Y)
    ctx.stroke()

    ctx.beginPath() // Box
    ctx.moveTo(-KEY_WIDTH, COURT_Y)
    ctx.lineTo(-KEY_WIDTH, COURT_Y - FT_LINE_Y)
    ctx.lineTo(KEY_WIDTH, COURT_Y - FT_LINE_Y)
    ctx.lineTo(KEY_WIDTH, COURT_Y)
    ctx.stroke()

    ctx.beginPath() // Basket
    ctx.moveTo(-BASKET_WIDTH, COURT_Y - BB_DIST)
    ctx.lineTo(BASKET_WIDTH, COURT_Y - BB_DIST)
    ctx.stroke()

    drawArc(ctx, BASKET_RADIUS, 0, 2 * Math.PI, 0, COURT_Y - BASKET_DIST) // Hoop

    ctx.beginPath() // Free throw circle
    drawArc(ctx, FT_CIRCLE_RADIUS, 0, Math.PI, 0, COURT_Y - FT_CIRCLE_DIST)

    ctx.setLineDash([20, 20]) // Dashed bottom half of free throw circle
    drawArc(
      ctx,
      FT_CIRCLE_RADIUS,
      Math.PI,
      2 * Math.PI,
      0,
      COURT_Y - FT_CIRCLE_DIST,
    )
    ctx.setLineDash([])

    shots.forEach((shot) => {
      ctx.beginPath()
      ctx.fillStyle = shot.shotMade
        ? "rgba(0, 128, 0, 0.5)"
        : "rgba(255, 0, 0, 0.5)"
      // ? "rgba(	119, 221, 119, 1)"
      // : "rgba(221, 78, 78, 1)"
      ctx.arc(
        shot.locX * SCALE,
        COURT_Y - shot.locY * SCALE,
        shotRadius * SCALE,
        0,
        2 * Math.PI,
      )
      ctx.fill()
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr)
    drawCourt(ctx)
  }, [shots, canvasWidth, canvasHeight, canvasScale])

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth
      const breakpoints = [
        { max: 640, value: 352, scale: 7 }, // sm
        { max: 768, value: 608, scale: 12.1 }, // md
        { max: 1024, value: 688, scale: 13.7 }, // lg
        { max: 1536, value: 784, scale: 15.5 }, // xl
        { max: 10000, value: 672, scale: 13.35 }, // bigger then xl
      ]
      const currentBreakpoint = breakpoints.find(
        (bp) => screenWidth < bp.max,
      ) || { value: 672, scale: 13.35 }
      setCanvasWidth(currentBreakpoint.value)
      setCanvasHeight(currentBreakpoint.value)
      setCanvasScale(currentBreakpoint.scale)
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [])
  return <canvas ref={canvasRef} />
})
