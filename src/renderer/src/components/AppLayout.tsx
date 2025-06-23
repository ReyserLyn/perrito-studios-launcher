import { ReactNode } from 'react'
import fondo from '../assets/images/fondos/noche-steve-dog.webp'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <img
        src={fondo}
        alt="Fondo de la aplicación"
        className="w-full h-full object-cover absolute top-0 left-0 -z-10"
      />
      {children}
    </div>
  )
}
