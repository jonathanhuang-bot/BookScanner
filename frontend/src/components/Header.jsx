import { useState } from 'react'
import { Link } from 'wouter'

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false)

    return (
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
                
                {/* Navigation Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2 text-white hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                        <span className="text-sm font-medium">Menu</span>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-2">
                                <Link href="/history">
                                    <button 
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-gray-50 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        View History
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Backdrop to close dropdown when clicking outside */}
                    {dropdownOpen && (
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setDropdownOpen(false)}
                        ></div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header