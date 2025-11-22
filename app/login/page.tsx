'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/lib/services/auth-service'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Por favor complete todos los campos')
      }

      const response = await authService.login(email, password)
      
      if (response.usuario) {
        // Determine role from API response or email pattern
        let role: 'admin' | 'gerente' = 'gerente'
        if (response.usuario.role) {
          role = response.usuario.role.toLowerCase() === 'admin' ? 'admin' : 'gerente'
        } else if (email.includes('admin@')) {
          role = 'admin'
        } else if (email.includes('gerente')) {
          role = 'gerente'
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify({
          id: response.usuario.id || response.usuario.correo,
          name: response.usuario.nombre,
          email: response.usuario.correo,
          role: role
        }))
        
        // Redirect to dashboard
        router.push('/')
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifique sus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Chinawok Admin</CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al panel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@chinawok.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              ¿No tiene una cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Registrarse
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
