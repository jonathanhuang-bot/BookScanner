import { Link } from 'wouter'
import { useState } from 'react'
function Upload() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file){
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
    if (files.length>0){
      const file = files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Bookshelf Photo</h1>
        <p className="text-gray-600 mb-8">Take a clear photo of a bookshelf with visible book spines.</p>
        
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
            <Link href="/preferences">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50">
                Back to Preferences
              </button>
            </Link>
            <Link href="/results">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                Get Recommendations
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload