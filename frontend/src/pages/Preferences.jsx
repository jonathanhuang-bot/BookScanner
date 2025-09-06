import { Link } from 'wouter'
import { useState } from 'react'

function Preferences() {
  const [selectedGenres, setSelectedGenres] = useState([])
  const [favoriteAuthors, setFavoriteAuthors] = useState([])
  const [currentAuthor, setCurrentAuthor] = useState('')
  const [avoidBooks, setAvoidBooks] = useState('')
  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Historical', 'Biography', 'Self-Help']

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted!', {selectedGenres, favoriteAuthors, avoidBooks})
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
  return (
    <div className="min-h-screen bg-white">
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
            <div className="flex justify-between mt-6">
              <Link href="/">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50">
                  Back to Home
                </button>
              </Link>
              <Link href="/upload">
                <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
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