import { Switch, Route } from 'wouter'
import './App.css'
import { AppProvider } from './contexts/AppContext'
import { DeviceProvider, DeviceDebugInfo } from './contexts/DeviceContext'
import Home from './pages/Home'
import Preferences from './pages/Preferences'
import Upload from './pages/Upload'
import Results from './pages/Results'
import History from './pages/History'
import SavedBooks from './pages/SavedBooks'

function App() {
  return (
    <DeviceProvider>
      <AppProvider>
        <div className="min-h-screen bg-white font-sans w-full overflow-x-hidden">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/preferences" component={Preferences} />
            <Route path="/upload" component={Upload} />
            <Route path="/results" component={Results} />
            <Route path="/history" component={History} />
            <Route path="/saved-books" component={SavedBooks} />
            <Route>404: Not Found</Route>
          </Switch>
          <DeviceDebugInfo />
        </div>
      </AppProvider>
    </DeviceProvider>
  )
}

export default App
