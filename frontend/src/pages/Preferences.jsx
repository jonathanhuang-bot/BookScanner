import { Link } from 'wouter'
import { useState } from 'react'
import { useApp } from "../contexts/AppContext"
import { useDevice } from '../contexts/DeviceContext'
import { processGoodreadsCSV, validateGoodreadsFile } from '../utils/api'
import Header from '../components/Header'

function Preferences() {
  const [selectedGenres, setSelectedGenres] = useState([])
  const [favoriteAuthors, setFavoriteAuthors] = useState([])
  const [currentAuthor, setCurrentAuthor] = useState('')
  const [avoidBooks, setAvoidBooks] = useState('')
  const [goodreadsFile, setGoodreadsFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Historical', 'Biography', 'Self-Help']
  const { updateUserPreferences } = useApp()
  const { deviceId, isReady } = useDevice()
  const handleSubmit = (e) => {
    e.preventDefault()

    const preferences = {
      genres: selectedGenres,
      authors: favoriteAuthors,
      avoid: avoidBooks
    }

    updateUserPreferences(preferences)
    console.log('Preferences saved!', preferences)
  }
  const addAuthor = () => {
    if (currentAuthor.trim() !==''){
      setFavoriteAuthors(prev => [...prev, currentAuthor.trim()])
      setCurrentAuthor('')
    }
  }

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
      ? prev.filter(g => g !== genre)
      : [...prev, genre]
    )
  }

  const handleGoodreadsUpload = async (event) => {
    const file = event.target.files[0]
    
    if (!file) {
      return
    }

    // Validate file using utility function
    const validation = validateGoodreadsFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    if (!isReady) {
      setError('Device initialization in progress, please wait...')
      return
    }

    setGoodreadsFile(file)
    setIsProcessing(true)
    setError(null)

    try {
      console.log('📖 Processing Goodreads CSV with device ID:', deviceId?.substring(0, 8) + '...')
      
      // Use new API utility with device ID integration
      const extractedPrefs = await processGoodreadsCSV(file)
      
      console.log('✅ Extracted preferences:', extractedPrefs)
      
      // Merge extracted preferences with existing ones
      setSelectedGenres(prev => [...new Set([...prev, ...extractedPrefs.genres])])
      setFavoriteAuthors(prev => [...new Set([...prev, ...extractedPrefs.authors])])
      setAvoidBooks(prev => prev ? `${prev}, ${extractedPrefs.avoid}` : extractedPrefs.avoid)

      // Show success message (you can replace with a nicer UI component)
      alert('Goodreads preferences imported successfully!')
      
    } catch (error) {
      console.error('❌ Goodreads processing error:', error)
      setError(`Error processing file: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    const preferences = {
      genres: selectedGenres,
      authors: favoriteAuthors,
      avoid: avoidBooks
    }

    updateUserPreferences(preferences)
    console.log('Preferences saved before navigation!', preferences)
  }



  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Set Your Preferences</h1>
        <p className="text-gray-600 mb-8">Tell us about your reading interests to get personalized recommendations.</p>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form onSubmit = {handleSubmit}>
            <div className = "mb-6">
              <h3 className = "text-lg font-medium text-gray-900 mb-4">Favorite Genres</h3>
              <div className = "grid grid-cols-4 gap-3">
                {genres.map(genre =>(
                  <button 
                    key={genre} 
                    type = "button" 
                    onClick = {()=>toggleGenre(genre)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'  // Selected = Gray
                      : 'bg-violet-600 text-white'                     // Unselected = Purple
                  }`}>
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Authors (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentAuthor}
                  onChange={(e) => setCurrentAuthor(e.target.value)}
                  placeholder="Type in your favorite authors"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500
              focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => addAuthor()}
                  className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2
              focus:ring-violet-500"
                >
                  Add
                </button>
              </div>
              {favoriteAuthors.length>0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Authors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {favoriteAuthors.map((author, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className = "mb-6">
              <label className = "block text-sm font-medium text-gray-700 mb-2">Things you don't like (optional)</label>
              <input 
                type = "text" 
                value = {avoidBooks} 
                onChange = {(e)=>setAvoidBooks(e.target.value)}
                placeholder = "e.g., Romance, Gore, Sad endings, Long books"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"></input>
            </div>
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import from Goodreads (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your Goodreads library export to automatically set your preferences based on your ratings.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleGoodreadsUpload}
                  disabled={isProcessing}
                  className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium
            file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {isProcessing && (
                  <span className="text-sm text-gray-500">Processing...</span>
                )}
                {goodreadsFile && !isProcessing && (
                  <span className="text-sm text-green-600">✓ {goodreadsFile.name}</span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Link href="/">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50">
                  Back to Home
                </button>
              </Link>
              <Link href="/upload">
                <button 
                  onClick = {handleContinue}
                  className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                  Continue to Upload
                </button>
              </Link>
            </div> 
          </form>
          
        </div>
      </div>
    </div>
  )
}

export default Preferences