import { BrowserRouter, Routes, Route, isRouteErrorResponse } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
// Page imports
import Welcome from './pages/Welcome/Welcome' 
import Dashboard from './pages/Dashboard/Dashboard'
import NotFound from './pages/NotFound/NotFound'
import Header from './assets/componets/Header/Header'

function App() {
  const { user, loading } = useAuth();

  return (

    <BrowserRouter>
      <DashboardProvider>
        {user && !loading && <Header />}
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
      </DashboardProvider>
    </BrowserRouter>
  )
}

export default App
