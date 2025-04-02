"use client"

import { useEffect } from "react"
import useLocalStorage from "./useLocalStorage"

/**
 * Custom hook for auto-saving form drafts
 * @param {string} formId - Unique identifier for the form
 * @param {Object} formValues - Current form values
 * @param {Function} setFormValues - Function to set form values
 * @param {number} saveInterval - Interval in ms to save draft (default: 2000)
 * @returns {Object} - { isDraftAvailable, loadDraft, clearDraft }
 */
const useFormDraft = (formId, formValues, setFormValues, saveInterval = 2000) => {
  // Use localStorage to store the draft
  const storageKey = `form_draft_${formId}`
  const [draft, setDraft, removeDraft] = useLocalStorage(storageKey, null)

  // Auto-save the form values at regular intervals
  useEffect(() => {
    if (!formId || !formValues) return

    // Only save if there are actual values
    if (Object.keys(formValues).length === 0) return

    const timer = setTimeout(() => {
      // Save the current form values and timestamp
      setDraft({
        values: formValues,
        timestamp: new Date().toISOString(),
      })
    }, saveInterval)

    return () => clearTimeout(timer)
  }, [formId, formValues, saveInterval, setDraft])

  // Check if a draft is available
  const isDraftAvailable = Boolean(draft?.values && draft?.timestamp)

  // Load the draft into the form
  const loadDraft = () => {
    if (isDraftAvailable && setFormValues) {
      setFormValues(draft.values)
      return true
    }
    return false
  }

  // Clear the draft
  const clearDraft = () => {
    removeDraft()
  }

  // Get the draft timestamp in a readable format
  const getDraftTimestamp = () => {
    if (!draft?.timestamp) return null

    try {
      const date = new Date(draft.timestamp)
      return date.toLocaleString()
    } catch (error) {
      console.error("Error formatting draft timestamp:", error)
      return draft.timestamp
    }
  }

  return {
    isDraftAvailable,
    loadDraft,
    clearDraft,
    draftTimestamp: getDraftTimestamp(),
  }
}

export default useFormDraft

