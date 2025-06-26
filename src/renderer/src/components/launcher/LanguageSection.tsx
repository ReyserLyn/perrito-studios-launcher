import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTranslation } from '@/hooks/use-translation'
import type { Language } from '@/types/launcher-config'
import { Globe } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

interface LanguageSectionProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export const LanguageSection = ({ currentLanguage, onLanguageChange }: LanguageSectionProps) => {
  const { t } = useTranslation()

  return (
    <ConfigCard
      icon={Globe}
      title={t('launcher.language.title')}
      description={t('launcher.language.description')}
    >
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('launcher.language.select_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es_ES">🇪🇸 Español</SelectItem>
          <SelectItem value="en_US">🇺🇸 English</SelectItem>
        </SelectContent>
      </Select>
    </ConfigCard>
  )
}
