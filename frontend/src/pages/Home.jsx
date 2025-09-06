import { Link } from 'wouter'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              <span className="text-lg font-medium text-gray-900">BookScanner</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          
          {/* Hero Section */}
          <div className="mb-10 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI bookshelf scanner and book recommender</h1>
            <p className="text-xl text-gray-600 mb-6">Find the perfect book for you from any bookshelf.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/preferences">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm h-10 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  Start Scanning
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Card */}
          <div className="my-12">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-violet-50 text-violet-600 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Book Discovery</h2>
                    <p className="text-gray-600 mt-1">Take a photo of an entire bookshelf at stores, the library, or a friend's house, and we'll help you figure out which ones you'll like!</p>
                    <Link href="/preferences" className="flex items-center text-black hover:text-gray-800 font-medium text-sm mt-3">
                      <span>Start scanning</span>
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 text-amber-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                    <span className="font-semibold">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Set Preferences</h3>
                </div>
                <p className="text-sm text-gray-600">Tell us about your reading interests or upload your Goodreads data for personalized recommendations.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 text-amber-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                    <span className="font-semibold">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Upload Photo</h3>
                </div>
                <p className="text-sm text-gray-600">Take a photo of any bookshelf and our AI will identify each book automatically.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 text-amber-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                    <span className="font-semibold">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Get Recommendations</h3>
                </div>
                <p className="text-sm text-gray-600">Discover which books best match your taste with our AI-powered recommendation engine.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="inline-flex justify-center items-center bg-violet-50 text-violet-600 h-12 w-12 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12"></path>
                <path d="m8 11 4 4 4-4"></path>
                <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Start Using BookScanner Today</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">Never miss a great book again. Our app helps you quickly find books that match your unique reading preferences even in a crowded bookshelf.</p>
            <Link href="/preferences">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm h-10 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium">
                Get Started Now
              </button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-center items-center text-xs text-gray-500 space-y-2 md:space-y-0 md:space-x-6">
              <span>© 2025 BookScanner. All rights reserved.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home