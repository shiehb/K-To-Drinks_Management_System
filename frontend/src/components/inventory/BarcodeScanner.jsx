"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "../ui"
import { toast } from "react-toastify"

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState("")
  const scannerRef = useRef(null)

  // Initialize barcode scanner
  useEffect(() => {
    // Load the barcode detection library
    const loadBarcodeDetector = async () => {
      if ("BarcodeDetector" in window) {
        try {
          // Check if BarcodeDetector is supported
          const formats = await window.BarcodeDetector.getSupportedFormats()
          scannerRef.current = new window.BarcodeDetector({ formats })
        } catch (error) {
          console.error("Barcode detection not supported:", error)
          toast.error("Barcode scanning is not supported in this browser")
        }
      } else {
        console.error("Barcode detection not supported")
        toast.error("Barcode scanning is not supported in this browser")
      }
    }

    loadBarcodeDetector()

    // Get available cameras
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setCameras(videoDevices)

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Error getting cameras:", error)
        toast.error("Unable to access cameras")
      }
    }

    getAvailableCameras()

    return () => {
      // Stop video stream when component unmounts
      stopVideoStream()
    }
  }, [])

  // Start video stream when camera is selected
  useEffect(() => {
    if (selectedCamera && scanning) {
      startVideoStream()
    }
  }, [selectedCamera, scanning])

  // Start video stream
  const startVideoStream = async () => {
    try {
      if (!selectedCamera) {
        toast.error("No camera selected")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Start scanning for barcodes
        scanBarcodes()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Unable to access camera")
      setScanning(false)
    }
  }

  // Stop video stream
  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Scan for barcodes
  const scanBarcodes = () => {
    if (!scannerRef.current || !videoRef.current || !canvasRef.current) return

    const scanFrame = async () => {
      if (!scanning) return

      try {
        // Draw current video frame to canvas
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

          // Detect barcodes in the current frame
          const barcodes = await scannerRef.current.detect(canvas)

          if (barcodes.length > 0) {
            // Found a barcode
            const barcode = barcodes[0]

            // Highlight the barcode
            context.beginPath()
            context.lineWidth = 4
            context.strokeStyle = "#FF0000"
            const { x, y, width, height } = barcode.boundingBox
            context.rect(x, y, width, height)
            context.stroke()

            // Stop scanning and call the callback
            setScanning(false)
            stopVideoStream()
            onScan(barcode.rawValue)
            return
          }
        }
      } catch (error) {
        console.error("Error scanning barcode:", error)
      }

      // Continue scanning
      requestAnimationFrame(scanFrame)
    }

    requestAnimationFrame(scanFrame)
  }

  // Toggle scanning
  const toggleScanning = () => {
    if (scanning) {
      setScanning(false)
      stopVideoStream()
    } else {
      setScanning(true)
    }
  }

  // Handle camera change
  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value)

    if (scanning) {
      stopVideoStream()
      setTimeout(startVideoStream, 500)
    }
  }

  // Manual barcode entry
  const handleManualEntry = () => {
    const barcode = prompt("Enter barcode manually:")
    if (barcode) {
      onScan(barcode)
    }
  }

  return (
    <div className="barcode-scanner">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Camera</label>
        <select
          value={selectedCamera}
          onChange={handleCameraChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={scanning}
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-md"
          style={{ display: scanning ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ display: scanning ? "block" : "none" }}
        />

        {!scanning && (
          <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Camera preview will appear here</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <Button onClick={toggleScanning} className="flex-1">
          {scanning ? "Stop Scanning" : "Start Scanning"}
        </Button>

        <Button variant="outline" onClick={handleManualEntry} className="flex-1">
          Manual Entry
        </Button>
      </div>
    </div>
  )
}

export default BarcodeScanner

