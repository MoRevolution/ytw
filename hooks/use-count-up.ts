import { useState, useEffect, useRef } from "react"

interface UseCountUpOptions {
  start?: number
  end: number
  duration?: number
  decimals?: number
  delay?: number
}

export function useCountUp({
  start = 0,
  end,
  duration = 1000,
  decimals = 0,
  delay = 0,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start)
  const countRef = useRef(start)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset when end changes
    countRef.current = start
    setCount(start)
    startTimeRef.current = null

    const startAnimation = () => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp
        }

        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const currentCount = start + (end - start) * eased
        countRef.current = currentCount
        setCount(currentCount)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [start, end, duration, delay])

  // Format the count with decimals
  const formattedCount = decimals > 0 
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString()

  return { count, formattedCount }
}
