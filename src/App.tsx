import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Page imports
import Welcome from './pages/Welcome/Welcome' 

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
