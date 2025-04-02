"use client"

import { useRef, useEffect, useState } from "react"

const SignaturePad = ({ width = 500, height = 200, onChange }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState(null)
  const [isEmpty, setIsEmpty] = useState(true)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set line style
    context.lineWidth = 2
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = "#000000"

    // Clear canvas
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)

    setCtx(context)

    // Add event listeners for touch devices
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      // Remove event listeners
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [width, height])

  // Start drawing
  const startDrawing = (x, y) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setIsEmpty(false)
  }

  // Draw
  const draw = (x, y) => {
    if (!isDrawing) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath()
      setIsDrawing(false)

      // Notify parent component of signature data
      if (onChange && !isEmpty) {
        const signatureData = canvasRef.current.toDataURL("image/png")
        onChange(signatureData)
      }
    }
  }

  // Handle mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    startDrawing(x, y)
  }

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    draw(x, y)
  }

  // Handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const rect = canvasRef.current.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      startDrawing(x, y)
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const rect = canvasRef.current.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      draw(x, y)
    }
  }

  const handleTouchEnd = () => {
    stopDrawing()
  }

  // Clear signature
  const clearSignature = () => {
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      setIsEmpty(true)

      // Notify parent component
      if (onChange) {
        onChange(null)
      }
    }
  }

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded"
        style={{ touchAction: "none", width: "100%", height: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  )
}

export default SignaturePad

