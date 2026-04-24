import { useEffect } from 'react'

function useClickOutside(ref, handler, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      handler()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [handler, isEnabled, ref])
}

export default useClickOutside
