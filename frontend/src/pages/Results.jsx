import { Link } from 'wouter'

function Results() {
  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Book Recommendations</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Books Found on Your Shelf</h2>
          <p className="text-gray-500 text-center py-4">Detected books will appear here...</p>
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

export default Results