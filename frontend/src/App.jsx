import { Switch, Route } from 'wouter'
import './App.css'
import Home from './pages/Home'
import Preferences from './pages/Preferences'
import Upload from './pages/Upload'
import Results from './pages/Results'

function App() {
  return (
    <div className="min-h-screen bg-white font-sans w-full overflow-x-hidden">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/preferences" component={Preferences} />
        <Route path="/upload" component={Upload} />
        <Route path="/results" component={Results} />
        <Route>404: Not Found</Route>
      </Switch>
    </div>
  )
}

export default App
