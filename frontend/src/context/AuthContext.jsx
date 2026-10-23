
import { createContext, useContext, useState } from 'react'
import { registerUser, loginUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skillbridge-user')) || null
    } catch {
      return null
    }
  })

  async function register(form) {
  const response = await registerUser({
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
  })

  // Registration successful hone ke baad login karo
  const loginResponse = await loginUser({
    email: form.email.trim(),
    password: form.password,
  })

  if (!loginResponse.token) {
    throw new Error('Account created, but login token was not received.')
  }

  const loggedInUser = {
    id: loginResponse.id,
    name: loginResponse.name,
    email: loginResponse.email,
  }

  localStorage.setItem('token', loginResponse.token)
  localStorage.setItem('skillbridge-user', JSON.stringify(loggedInUser))

  setUser(loggedInUser)

  return response
}

  async function login(form) {
    const response = await loginUser({
      email: form.email,
      password: form.password,
    })

    if (!response.token) {
      throw new Error('Login successful, but no authentication token was received.')
    }

    const loggedInUser = {
      id: response.id,
      name: response.name,
      email: response.email,
    }

    // Save JWT token and user details
    localStorage.setItem('token', response.token)
    localStorage.setItem(
      'skillbridge-user',
      JSON.stringify(loggedInUser)
    )

    setUser(loggedInUser)

    return response
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('skillbridge-user')
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
