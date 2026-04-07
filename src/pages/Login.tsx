import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const { signIn, signInWithGoogle, resetPassword, updatePassword, session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsRecovery(true)
    } else if (hash.includes('error_description')) {
      const errorMsg = new URLSearchParams(hash.substring(1)).get('error_description')
      if (errorMsg) {
        toast.error('Erro na autenticação', {
          description: decodeURIComponent(errorMsg).replace(/\+/g, ' '),
        })
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      }
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session && !isRecovery && !window.location.hash.includes('type=recovery')) {
      navigate('/')
    }
  }, [session, isRecovery, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    if (error) {
      toast.error('Erro ao fazer login', { description: 'Verifique suas credenciais' })
    } else {
      toast.success('Bem-vindo ao Carbosul Vendas Externas')
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await signInWithGoogle()
    setIsLoading(false)
    if (error) {
      toast.error('Erro no login social', { description: error.message })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await resetPassword(email)
    setIsLoading(false)
    if (error) {
      toast.error('Erro ao enviar e-mail', { description: error.message })
    } else {
      toast.success('E-mail enviado', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
      setIsForgotPassword(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await updatePassword(newPassword)
    setIsLoading(false)
    if (error) {
      toast.error('Erro ao atualizar senha', { description: error.message })
    } else {
      toast.success('Senha atualizada com sucesso')
      setIsRecovery(false)
      navigate('/')
    }
  }

  if (isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">Nova Senha</CardTitle>
              <CardDescription className="text-base mt-2">
                Digite sua nova senha de acesso
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-12"
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">Recuperar Senha</CardTitle>
              <CardDescription className="text-base mt-2">
                Enviaremos um link de recuperação para o seu e-mail
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsForgotPassword(false)}
                disabled={isLoading}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Carbosul Vendas</CardTitle>
            <CardDescription className="text-base mt-2">
              Acesse o sistema de gestão de vendas externas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-muted-foreground font-normal"
                onClick={() => setIsForgotPassword(true)}
              >
                Esqueci minha senha
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Acesso Gestor: rafamarsul@gmail.com</p>
            <p>Senha: securepassword123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
