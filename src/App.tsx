import { BrowserRouter, Routes, Route, isRouteErrorResponse } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
// Page imports
import Welcome from './pages/Welcome/Welcome' 
import NotFound from './pages/NotFound/NotFound'
import Header from './assets/componets/Header/Header'
import ItinSelect from './pages/ItinSelect/ItinSlect'
import ItinEdit from './pages/ItinEdit/ItinEdit'
import { TripEditProvider } from './context/TripEditContext'

function App() {
  const { user, loading } = useAuth();

  return (

    <BrowserRouter>
      <DashboardProvider>
        <TripEditProvider>
          {user && !loading && <Header />}
          <Routes>
            <Route path='/' element={<Welcome/>}/>

            {/* Protected Route - Only accessible if Directus returns a user */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ItinSelect />
                </ProtectedRoute>
              } 
            />
            <Route
              path='/edit/:slug'
              element={
                <ProtectedRoute>
                  <ItinEdit/>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TripEditProvider>
      </DashboardProvider>
    </BrowserRouter>
  )
}

export default App
