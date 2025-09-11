import { Link, useLocation } from 'wouter'
import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useDevice } from '../contexts/DeviceContext'
import { analyzeBookshelf, fileToBase64, validateImageFile } from '../utils/api'

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)
  const { updateAnalysisResults, userPreferences } = useApp()
  const { deviceId, isReady } = useDevice()
  const [, navigate] = useLocation()
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setError(null)
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      
      setError(null)
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!imagePreview || !selectedFile) {
      setError('Please select an image first')
      return
    }

    if (!isReady) {
      setError('Device initialization in progress, please wait...')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log('🔄 Starting image analysis with device ID:', deviceId?.substring(0, 8) + '...')
      
      // Convert file to base64 using utility function
      const base64Image = await fileToBase64(selectedFile)

      const preferences = userPreferences
      console.log('📊 Using preferences:', preferences)
      
      // Use new API utility with device ID integration
      const result = await analyzeBookshelf(base64Image, preferences)
      
      console.log('✅ Analysis result:', result)
      updateAnalysisResults(result)
      navigate('/results')

    } catch (error) {
      console.error('❌ Analysis error:', error)
      setError(`Error analyzing image: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  
  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Bookshelf Photo</h1>
        <p className="text-gray-600 mb-8">Take a clear photo of a bookshelf with visible book spines.</p>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {/* Device Loading State */}
        {!isReady && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">🔄 Initializing device ID...</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-300 hover:border-violet-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">Click to upload image</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
            </label>
          </div>
          {imagePreview && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Image Preview:</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Bookshelf preview"
                  className="w-full max-w-md mx-auto block"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {selectedFile?.name} ({Math.round(selectedFile?.size / 1024)} KB)
              </p>
            </div>
          )}          
          <div className="flex justify-between mt-6">
            {/*<Link href="/preferences">*/}
              <button className="px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50">
                Back to Preferences
              </button>
            {/*</div></Link>*/}
            {/*<Link href="/results">*/}
              <button 
                onClick = {handleAnalyzeImage}
                disabled = {!imagePreview||isUploading}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                {isUploading ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            {/*</Link>*/}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload