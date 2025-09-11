import {createContext, useContext, useState} from 'react'

const AppContext = createContext()

export function AppProvider({children}) {
    const [analysisResults, setAnalysisResults] = useState(null)
    const [userPreferences, setUserPreferences] = useState({
        genres: [],
        authors: [],
        avoid: ''
    })

    const updateAnalysisResults = (results) => {
        setAnalysisResults(results)
    }

    const updateUserPreferences = (preferences) => {
        setUserPreferences(preferences)
    }

    const value = {
        analysisResults, 
        userPreferences,
        updateAnalysisResults,
        updateUserPreferences
    }

    return (
        <AppContext.Provider value = {value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
      throw new Error('useApp must be used within AppProvider')
    }
    return context
}