import { createContext, useContext, useEffect, useState } from 'react'
import { User, createClient } from '@supabase/supabase-js'

// look at you, not even checking if these exist smh
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase setup. Did you forget to read the docs? 🙄')
}

// at least use a properly typed client you absolute walnut
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AuthContextType {
  user: User | null
  session: any | null // any? really? fix your types bro
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // imagine not having proper auth state management
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // this is how you listen for auth changes, you absolute beginner
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin // wow you didn't even handle redirects properly
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error // let the component handle the error like a grown-up
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    signInWithGoogle,
    signOut,
    loading
  }

  // at least wrap your providers properly
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook because apparently you need everything spelled out
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Did you forget to RTFM? 🤦‍♂️')
  }
  return context
} 