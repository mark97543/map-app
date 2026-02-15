import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
// Page imports
import Welcome from './pages/Welcome/Welcome' 
import Dashboard from './pages/Dashboard/Dashboard'
import NotFound from './pages/NotFound/NotFound'

function App() {


  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome/>}/>

        {/* Protected Route - Only accessible if Directus returns a user */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
