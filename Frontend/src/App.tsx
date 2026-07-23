import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import PublicRoute from './routes/PublicRoutes'
import AdminRoutes from './routes/AdminRoutes'

import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Users from './pages/Users/Users'

function App() {
  return (

    <>
      <Toaster
        toastOptions={{
          style: {
            fontFamily: 'Arial, sans-serif',
            background: 'var(--bg)',
            color: 'var(--text)'
          },
        }}
      />

      <Routes>
        <Route path='/' element={<Home />} />


        <Route element={<PublicRoute />} >
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>


        <Route element={<AdminRoutes />} >
          <Route path='/users' element={<Users />} />
        </Route>
      </Routes>
    </>

  )
}

export default App
