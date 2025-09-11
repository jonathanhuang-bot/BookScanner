import { useState, useEffect } from 'react'
import { Link } from 'wouter'

function SavedBooks() {
  const [savedBooks, setSavedBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingNotes, setEditingNotes] = useState(null)
  const [notesText, setNotesText] = useState('')
  const [read, setRead] = useState(false)

  // Fetch saved books when component mounts
  useEffect(() => {
    fetchSavedBooks()
  }, [])

  const fetchSavedBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/saved-books', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSavedBooks(data.books || [])
      } else {
        throw new Error('Failed to fetch saved books')
      }
    } catch (err) {
      console.error('Error fetching saved books:', err)
      setError('Failed to load your reading list. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeBook = async (book) => {
    try {
      const response = await fetch(`/saved-books?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Remove book from UI
        setSavedBooks(prev => prev.filter(b => b.id !== book.id))
      } else {
        throw new Error('Failed to remove book')
      }
    } catch (err) {
      console.error('Error removing book:', err)
      setError('Failed to remove book. Please try again.')
    }
  }

  const toggleReadStatus = async (book) => {
    try {
      const response = await fetch(`/saved-books/${book.id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          is_read: !book.is_read
        })
      })
      if (response.ok){
        const data = await response.json()
        setSavedBooks(prevBooks => 
          prevBooks.map(b =>
            b.id === book.id 
            ? {...b, is_read: !book.is_read}
            : b
          )
        )
      } else {
        throw new Error('failed to update read status')
      }
    } catch (err) {
      console.error('Error updating read status:', err)
      setError('Failed to update read status. Please try again.')
    }
  }

  const startEditingNotes = (book) => {
    setEditingNotes(book.id)
    setNotesText(book.additional_notes|| '')
  }

  const saveNotes = async (bookId) => {
    try {
      const response = await fetch(`/saved-books/${bookId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: notesText
        })
      })
      if (response.ok){
        const data = await response.json()
        setSavedBooks(prevBooks =>
          prevBooks.map(book =>
            book.id === bookId
            ? {...book, additional_notes: notesText}
            : book
          )
        )
        setEditingNotes(null)
        setNotesText('')
      } else {
        throw new Error('Failed to save')
      } 
    }
    catch (err) {
      console.error('Error saving notes:', err)
      setError('Failed to save notes. Please try again.')
    }
  }

  const cancelEditingNotes = () => {
    setEditingNotes(null)
    setNotesText('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Reading List</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your books...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Reading List</h1>
          <Link href="/preferences">
            <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
              Scan More Books
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {savedBooks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="h-16 w-16 mx-auto mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Your reading list is empty</h2>
            <p className="text-gray-600 mb-6">Save books to read later by clicking "Save for Later" on any book recommendation.</p>
            <Link href="/preferences">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                Scan Books Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedBooks.map((book) => (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{book.title}</h3>
                    <p className="text-gray-600 mb-2">by {book.author}</p>
                    
                    {book.match_score && (
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-sm">
                          {book.match_score}% match
                        </div>
                        {book.is_read && (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                            ✓ Read
                          </div>
                        )}
                      </div>
                    )}
                    
                    {book.match_reason && (
                      <p className="text-gray-700 text-sm mb-3">{book.match_reason}</p>
                    )}
                    
                    {/* Notes Section */}
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Notes:</h4>
                      {editingNotes === book.id ? (
                        // Editing mode
                        <div>
                          <textarea 
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Add your thoughts about this book..."
                            rows="3"
                          />
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => saveNotes(book.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={cancelEditingNotes}
                              className="px-3 py-1 bg-gray-300 text-white rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            {book.additional_notes || 'No notes yet. Click "Add Notes" to add your thoughts!'}
                          </p>
                          <button 
                            onClick={() => startEditingNotes(book)}
                            className="px-3 py-1 bg-gray-200 text-white rounded text-sm hover:bg-gray-300"
                          >
                            {book.additional_notes ? 'Edit Notes' : 'Add Notes'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Saved on {new Date(book.saved_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Buttons - stacked vertically on the right */}
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => removeBook(book)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => toggleReadStatus(book)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        book.is_read
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-white hover:bg-gray-200'
                      }`}
                    >
                      {book.is_read ? '✓ Read' : 'Mark as Read'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <Link href="/">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SavedBooks