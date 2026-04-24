import { use } from 'react'
import { AuthContext } from '../context/AuthContext'

function useAuth() {
  return use(AuthContext)
}

export default useAuth
