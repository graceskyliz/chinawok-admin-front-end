import { useAuth } from '@/lib/contexts/auth-context'

/**
 * Hook to get the local_id of the current gerente user
 * Returns null if user is not a gerente or if local_id is not available
 */
export function useLocalId(): string | null {
  const { user } = useAuth()
  
  if (!user || user.role !== 'gerente') {
    return null
  }
  
  return user.local_id || null
}
