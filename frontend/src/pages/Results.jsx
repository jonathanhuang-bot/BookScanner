import { Link } from 'wouter'
import { useApp } from "../contexts/AppContext"

function Results() {
  const { analysisResults } = useApp()
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
                {analysisResults.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        <p className="text-gray-600">by {rec.author}</p>
                      </div>
                      <div className="flex items-center bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
                        {rec.matchScore}% match
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{rec.matchReason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recommendations found based on your preferences.</p>
            )}
            
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
  
}

export default Results