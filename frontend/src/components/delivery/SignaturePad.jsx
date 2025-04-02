"use client"

import { useRef, useState, useEffect } from "react"

const SignaturePad = ({
  width = 400,
  height = 200,
  onChange,
  onClose,
  lineWidth = 2,
  lineColor = "#000000",
  backgroundColor = "#ffffff",
}) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas background
    context.fillStyle = backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Set line style
    context.lineWidth = lineWidth
    context.lineJoin = "round"
    context.lineCap = "round"
    context.strokeStyle = lineColor

    // Add signature line
    context.beginPath()
    context.moveTo(20, height - 30)
    context.lineTo(width - 20, height - 30)
    context.stroke()

    // Add signature label
    context.font = "12px Arial"
    context.fillStyle = "#999999"
    context.fillText("Signature", 20, height - 10)
  }, [width, height, lineWidth, lineColor, backgroundColor])

  // Handle mouse events
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    setIsDrawing(true)
    setLastPosition({ x, y })
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    context.beginPath()
    context.moveTo(lastPosition.x, lastPosition.y)
    context.lineTo(x, y)
    context.stroke()

    setLastPosition({ x, y })
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault()
    startDrawing(e)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    draw(e)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    stopDrawing()
  }

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    context.fillStyle = backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw signature line
    context.beginPath()
    context.moveTo(20, height - 30)
    context.lineTo(width - 20, height - 30)
    context.stroke()

    // Redraw signature label
    context.font = "12px Arial"
    context.fillStyle = "#999999"
    context.fillText("Signature", 20, height - 10)

    setHasSignature(false)
  }

  // Save signature
  const saveSignature = () => {
    if (!hasSignature) {
      alert("Please provide a signature before submitting.")
      return
    }

    const canvas = canvasRef.current
    const signatureData = canvas.toDataURL("image/png")

    if (onChange) {
      onChange(signatureData)
    }
  }

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="flex justify-between mt-4">
        <button onClick={clearSignature} className="btn btn-outline" type="button">
          Clear
        </button>

        <div className="space-x-2">
          <button onClick={onClose} className="btn btn-secondary" type="button">
            Cancel
          </button>

          <button onClick={saveSignature} className="btn btn-primary" type="button" disabled={!hasSignature}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignaturePad

