import { Link } from 'wouter'
import { useApp } from "../contexts/AppContext"
import { useState, useEffect } from 'react'

function Results() {
  const { analysisResults } = useApp()
  const [savedBooks, setSavedBooks] = useState(new Set())
  const [savingBooks, setSavingBooks] = useState(new Set())

  // Check which books are already saved when component mounts
  useEffect(() => {
    if (analysisResults?.recommendations) {
      checkSavedBooks()
    }
  }, [analysisResults])

  const checkSavedBooks = async () => {
    if (!analysisResults?.recommendations) return
    
    const savedSet = new Set()
    
    for (const rec of analysisResults.recommendations) {
      try {
        const response = await fetch(`/saved-books/check?title=${encodeURIComponent(rec.title)}&author=${encodeURIComponent(rec.author)}`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.is_saved) {
            savedSet.add(`${rec.title}-${rec.author}`)
          }
        }
      } catch (error) {
        console.error('Error checking saved status:', error)
      }
    }
    
    setSavedBooks(savedSet)
  }

  const saveBook = async (book) => {
    const bookKey = `${book.title}-${book.author}`
    setSavingBooks(prev => new Set([...prev, bookKey]))
    
    try {
      const response = await fetch('/saved-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          match_score: book.matchScore,
          match_reason: book.matchReason,
          source_session_id: analysisResults.session_id
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSavedBooks(prev => new Set([...prev, bookKey]))
        }
      } else {
        console.error('Failed to save book')
      }
    } catch (error) {
      console.error('Error saving book:', error)
    } finally {
      setSavingBooks(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookKey)
        return newSet
      })
    }
  }

  const unsaveBook = async (book) => {
    const bookKey = `${book.title}-${book.author}`
    setSavingBooks(prev => new Set([...prev, bookKey]))
    
    try {
      const response = await fetch(`/saved-books?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSavedBooks(prev => {
            const newSet = new Set(prev)
            newSet.delete(bookKey)
            return newSet
          })
        }
      } else {
        console.error('Failed to unsave book')
      }
    } catch (error) {
      console.error('Error unsaving book:', error)
    } finally {
      setSavingBooks(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookKey)
        return newSet
      })
    }
  }
  if (!analysisResults){
    return (
    <div className="min-h-screen bg-white">
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Book Recommendations</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Books Found on Your Shelf</h2>
          <p className="text-gray-500 text-center py-4">({analysisResults.detected_books?.length || 0})</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <p className="text-gray-500 text-center py-4">Book recommendations will appear here...</p>
          
          <div className="flex justify-center mt-6">
            <Link href="/">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                Start Over
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
  }
  else {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Book Recommendations</h1>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Books Found on Your Shelf ({analysisResults.detected_books?.length || 0})</h2>
            {analysisResults.detected_books?.length > 0 ? (
              <div className="grid gap-3">
                {analysisResults.detected_books.map((book, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No books detected on your shelf.</p>
            )}
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recommended for You ({analysisResults.recommendations?.length || 0})</h2>
            {analysisResults.recommendations?.length > 0 ? (
              <div className="grid gap-4">
                {analysisResults.recommendations.map((rec, index) => {
                  const bookKey = `${rec.title}-${rec.author}`
                  const isSaved = savedBooks.has(bookKey)
                  const isSaving = savingBooks.has(bookKey)
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <p className="text-gray-600">by {rec.author}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
                            {rec.matchScore}% match
                          </div>
                          <button
                            onClick={() => isSaved ? unsaveBook(rec) : saveBook(rec)}
                            disabled={isSaving}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              isSaved 
                                ? 'bg-green-100 text-grey hover:bg-green-200' 
                                : 'bg-blue-100 text-white hover:bg-blue-200'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isSaving ? '...' : isSaved ? 'Saved' : 'Save for Later'}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{rec.matchReason}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recommendations found based on your preferences.</p>
            )}
            
            <div className="flex justify-center gap-4 mt-6">
              <Link href="/">
                <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                  Start Over
                </button>
              </Link>
              <Link href="/saved-books">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  View Reading List
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
}

export default Results