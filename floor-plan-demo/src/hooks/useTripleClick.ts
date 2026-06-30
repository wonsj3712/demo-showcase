import { useRef, useCallback } from 'react'

export function useTripleClick(onTripleClick: () => void, timeout = 500) {
  const clickCount = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(() => {
    clickCount.current += 1

    if (clickCount.current === 3) {
      clickCount.current = 0
      if (timer.current) clearTimeout(timer.current)
      onTripleClick()
      return
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      clickCount.current = 0
    }, timeout)
  }, [onTripleClick, timeout])
}
