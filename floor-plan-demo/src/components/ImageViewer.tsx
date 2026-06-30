import { useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageViewerProps {
  src: string
  onClose: () => void
}

export default function ImageViewer({ src, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 5))
      if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.25))
      if (e.key === '0') { setScale(1); setPosition({ x: 0, y: 0 }) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(s => Math.max(0.25, Math.min(5, s + delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setDragging(false)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setScale(s => Math.min(s + 0.25, 5))}
          className="p-2 rounded bg-white/20 text-white hover:bg-white/30"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.25, 0.25))}
          className="p-2 rounded bg-white/20 text-white hover:bg-white/30"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
          className="p-2 rounded bg-white/20 text-white hover:bg-white/30"
        >
          <RotateCcw size={18} />
        </button>
        <span className="text-white text-sm px-2">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded bg-white/20 text-white hover:bg-white/30"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ width: '100%', height: '100%' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={src}
          alt="Enlarged view"
          draggable={false}
          className="select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            maxWidth: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-40%',
            marginLeft: '-40%',
            width: '80%',
          }}
        />
      </div>
    </div>
  )
}
