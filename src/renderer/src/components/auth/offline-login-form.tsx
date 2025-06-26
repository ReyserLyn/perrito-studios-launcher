import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks'
import { useAddMojangAccount } from '@/hooks/auth/use-auth'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import formImage from '../../assets/images/fondos/noche-steve-dog.webp'
import logoImage from '../../assets/images/logos/Cua_Color_LBlanco.webp'

interface OfflineLoginFormProps {
  onBack?: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
  showLogo?: boolean
  title?: string
  description?: string
  placeholder?: string
  className?: string
}

export function OfflineLoginForm({
  onBack,
  onSuccess,
  onError,
  showLogo = true,
  title,
  description,
  placeholder,
  className = ''
}: OfflineLoginFormProps) {
  const { t } = useTranslation()

  const finalTitle = title || t('auth.offline.login.title')
  const finalDescription = description || t('auth.offline.login.subtitle')
  const finalPlaceholder = placeholder || t('auth.offline.login.form.placeholder')

  const [username, setUsername] = useState('')
  const addMojangAccount = useAddMojangAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error(t('auth.offline.status.error'))
      return
    }

    addMojangAccount.mutate(username.trim(), {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        onError?.(error)
      }
    })
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 flex  ${className}`}>
      <img
        src={formImage}
        alt="Perrito Studios Logo"
        className="w-full h-auto object-cover mx-auto opacity-90 -z-10 absolute blur-sm"
      />

      {showLogo && (
        <div className="flex-1 flex items-center justify-center ">
          <div className="text-center">
            <img
              src={logoImage}
              alt="Perrito Studios Logo"
              className="w-80 h-auto object-contain mx-auto opacity-90"
            />
          </div>
        </div>
      )}

      <div className={`${showLogo ? 'flex-1' : 'w-full'} flex items-center justify-center `}>
        <Card className="w-full max-w-md mx-8 bg-gray-950/80 ">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl font-acherus text-white">{finalTitle}</CardTitle>
            <p className="text-gray-400 text-sm">{finalDescription}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">
                  {t('auth.offline.form.label')}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={finalPlaceholder}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  disabled={addMojangAccount.isPending}
                  autoFocus
                />
              </div>

              <div className="flex space-x-3 pt-2">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    disabled={addMojangAccount.isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.actions.back')}
                  </Button>
                )}

                <Button
                  type="submit"
                  className={`${onBack ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
                  disabled={addMojangAccount.isPending}
                >
                  {addMojangAccount.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('auth.offline.status.loading')}
                    </>
                  ) : (
                    t('auth.offline.form.login')
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
