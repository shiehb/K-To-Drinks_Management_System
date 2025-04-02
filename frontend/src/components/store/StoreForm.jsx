"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { storeService } from "../../services/api"
import MapLocationPicker from "../common/MapLocationPicker"
import { Button, Card, Input, Select } from "../ui"
import { useFormik } from "formik"
import * as Yup from "yup"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_LAT = 16.63614047965268
const DEFAULT_LNG = 120.31339285476308

const StoreForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [markerPosition, setMarkerPosition] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  })
  const [draftSaved, setDraftSaved] = useState(false)
  const [draftInterval, setDraftIntervalId] = useState(null)

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Store name is required"),
    location: Yup.string().required("Location is required"),
    owner_name: Yup.string().required("Owner name is required"),
    number: Yup.string()
      .required("Contact number is required")
      .matches(/^[0-9+]+$/, "Contact number should contain only numbers and + sign"),
    email: Yup.string().email("Invalid email address").nullable(),
    day: Yup.string().required("Delivery day is required"),
    lat: Yup.number().required("Latitude is required"),
    lng: Yup.number().required("Longitude is required"),
  })

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: "",
      location: "",
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      owner_name: "",
      email: "",
      number: "",
      day: days[0],
    },
    validationSchema,
    onSubmit: handleSubmit,
  })

  // Load store data if editing
  useEffect(() => {
    if (id) {
      fetchStoreData()
    } else {
      // Initialize user location for new stores
      initUserLocation()
    }

    // Setup auto-save draft interval
    const intervalId = setInterval(saveDraft, 30000) // Save draft every 30 seconds
    setDraftIntervalId(intervalId)

    // Load draft if available
    const savedDraft = localStorage.getItem(`store_draft_${id || "new"}`)
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft)
      formik.setValues(draftData)
      setMarkerPosition({ lat: draftData.lat, lng: draftData.lng })
      toast.info("Draft loaded")
    }

    return () => {
      if (draftInterval) clearInterval(draftInterval)
    }
  }, [id])

  // Fetch store data for editing
  const fetchStoreData = async () => {
    setIsLoading(true)
    try {
      const response = await storeService.getById(id)
      if (response.success) {
        const storeData = response.data
        formik.setValues({
          name: storeData.name,
          location: storeData.location,
          lat: storeData.lat,
          lng: storeData.lng,
          owner_name: storeData.owner_name,
          email: storeData.email || "",
          number: storeData.number,
          day: storeData.day,
        })
        setMarkerPosition({ lat: storeData.lat, lng: storeData.lng })
      } else {
        toast.error("Failed to load store data")
        navigate("/stores")
      }
    } catch (error) {
      console.error("Error fetching store:", error)
      toast.error("Error loading store data")
      navigate("/stores")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize user location
  const initUserLocation = async () => {
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 60000,
          })
        })

        const { latitude, longitude } = position.coords
        const lat = latitude && !isNaN(latitude) ? latitude : DEFAULT_LAT
        const lng = longitude && !isNaN(longitude) ? longitude : DEFAULT_LNG

        setMarkerPosition({ lat, lng })
        formik.setFieldValue("lat", lat)
        formik.setFieldValue("lng", lng)
      }
    } catch (err) {
      console.error("Location error:", err)
      toast.error("Using default location")
    }
  }

  // Handle marker position change from map
  const handleMarkerPositionChange = (lat, lng) => {
    const newLat = lat || DEFAULT_LAT
    const newLng = lng || DEFAULT_LNG
    setMarkerPosition({ lat: newLat, lng: newLng })
    formik.setFieldValue("lat", newLat)
    formik.setFieldValue("lng", newLng)
  }

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsLoading(true)
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser")
        setIsLoading(false)
        return
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Update marker position
      setMarkerPosition({ lat: latitude, lng: longitude })
      formik.setFieldValue("lat", latitude)
      formik.setFieldValue("lng", longitude)

      // Try to get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          formik.setFieldValue("location", data.display_name)
        }
      }

      toast.success("Current location detected successfully!")
    } catch (error) {
      console.error("Location error:", error)
      toast.error(`Failed to get location: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Save draft
  const saveDraft = () => {
    if (formik.dirty) {
      localStorage.setItem(`store_draft_${id || "new"}`, JSON.stringify(formik.values))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    }
  }

  // Handle form submission
  async function handleSubmit(values) {
    setIsLoading(true)
    try {
      let response

      if (id) {
        response = await storeService.update(id, values)
      } else {
        response = await storeService.create(values)
      }

      if (response.success) {
        toast.success(`Store ${id ? "updated" : "created"} successfully!`)
        // Clear draft after successful save
        localStorage.removeItem(`store_draft_${id || "new"}`)
        navigate("/stores")
      } else {
        // Handle validation errors
        if (response.error.fields) {
          Object.keys(response.error.fields).forEach((field) => {
            formik.setFieldError(field, response.error.fields[field])
          })
        } else {
          toast.error(response.error.message)
        }
      }
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save store")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="store-form-container">
      <Card className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{id ? "Edit Store" : "Create New Store"}</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Store Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter store name"
                  className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location *
                </label>
                <div className="flex">
                  <Input
                    id="location"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter store location"
                    className={`flex-grow ${formik.touched.location && formik.errors.location ? "border-red-500" : ""}`}
                  />
                  <Button type="button" onClick={handleGetCurrentLocation} className="ml-2" disabled={isLoading}>
                    <i className="fas fa-map-marker-alt"></i>
                  </Button>
                </div>
                {formik.touched.location && formik.errors.location && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="owner_name" className="block text-sm font-medium mb-1">
                  Owner Name *
                </label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  value={formik.values.owner_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter owner name"
                  className={formik.touched.owner_name && formik.errors.owner_name ? "border-red-500" : ""}
                />
                {formik.touched.owner_name && formik.errors.owner_name && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.owner_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium mb-1">
                    Contact Number *
                  </label>
                  <Input
                    id="number"
                    name="number"
                    value={formik.values.number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter contact number"
                    className={formik.touched.number && formik.errors.number ? "border-red-500" : ""}
                  />
                  {formik.touched.number && formik.errors.number && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email (Optional)
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter email address"
                    className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="day" className="block text-sm font-medium mb-1">
                  Delivery Day *
                </label>
                <Select
                  id="day"
                  name="day"
                  value={formik.values.day}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.day && formik.errors.day ? "border-red-500" : ""}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
                {formik.touched.day && formik.errors.day && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.day}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-64 md:h-80 border rounded-md overflow-hidden">
                <MapLocationPicker
                  lat={markerPosition.lat}
                  lng={markerPosition.lng}
                  onMarkerPositionChange={handleMarkerPositionChange}
                  isDraggable={true}
                  markerLabel={formik.values.name || "New Store"}
                  markerAddress={formik.values.location || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <Input type="text" value={markerPosition.lat.toFixed(6)} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <Input type="text" value={markerPosition.lng.toFixed(6)} readOnly className="bg-gray-50" />
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(`https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`, "_blank")
                  }
                  className="w-full"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Preview in Google Maps
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            {draftSaved && <span className="text-green-500 text-sm">Draft saved</span>}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/stores")} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formik.isValid}>
                {isLoading ? "Saving..." : id ? "Update Store" : "Create Store"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default StoreForm

