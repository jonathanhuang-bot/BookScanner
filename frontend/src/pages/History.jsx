import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { useDevice } from '../contexts/DeviceContext'
import { getUserHistory } from '../utils/api'

function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedSession, setExpandedSession] = useState(null)
    const { deviceId, isReady } = useDevice()

    useEffect(() => {
        if (isReady) {
            loadHistory()
        }
    }, [isReady])

    const loadHistory = async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('📜 Loading user history...')
            
            const data = await getUserHistory()
            setHistory(data.history || [])
            console.log(`✅ Loaded ${data.total_sessions} analysis sessions`)
            
        } catch (err) {
            console.error('❌ Error loading history:', err)
            setError(`Failed to load history: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const toggleSession = (sessionId) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId)
    }

    const getBookMatchColor = (matchScore) => {
        if (matchScore >= 80) return 'text-green-600 bg-green-50'
        if (matchScore >= 60) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    if (!isReady) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing...</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Analysis History</h1>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                        <span className="ml-3 text-gray-600">Loading your history...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
                    <Link href="/" className="text-violet-600 hover:text-violet-700 font-medium">
                        ← Back to Home
                    </Link>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                        <button 
                            onClick={loadHistory}
                            className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Device ID Display (Development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-600 font-mono">
                            Device ID: {deviceId?.substring(0, 8)}...
                        </p>
                    </div>
                )}

                {/* History List */}
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                        <p className="text-gray-600 mb-6">Start by uploading a bookshelf photo to see your analysis history here.</p>
                        <Link 
                            href="/upload" 
                            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            Upload Photo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-gray-600 mb-4">
                            {history.length} analysis session{history.length !== 1 ? 's' : ''} found
                        </p>
                        
                        {history.map((session) => (
                            <div key={session.session_id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                {/* Session Header */}
                                <div 
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleSession(session.session_id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Bookshelf Analysis
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(session.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    📚 {session.detected_books_count} books detected
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    ⭐ {session.recommendations_count} recommendations
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">
                                            {expandedSession === session.session_id ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Session Details */}
                                {expandedSession === session.session_id && (
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        {/* Detected Books */}
                                        <div className="mb-6 mt-6">
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">Detected Books</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {session.detected_books.map((book, index) => (
                                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="font-medium text-sm text-gray-900">{book.title}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                                            <div className="space-y-3">
                                                {session.recommendations.map((rec, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                                                                <p className="text-sm text-gray-600">{rec.author}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookMatchColor(rec.matchScore)}`}>
                                                                {rec.matchScore}% match
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 italic">"{rec.matchReason}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Refresh Button */}
                {history.length > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={loadHistory}
                            disabled={loading}
                            className="px-4 py-2 text-white hover:text-white hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh History'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default History