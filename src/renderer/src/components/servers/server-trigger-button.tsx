import { Button } from '@/components/ui/button'
import { Server } from 'lucide-react'

interface ServerTriggerButtonProps {
  displayName: string
  displayVersion?: string
  className?: string
  onClick?: () => void
}

export function ServerTriggerButton({
  displayName,
  displayVersion,
  className = '',
  onClick
}: ServerTriggerButtonProps) {
  return (
    <Button
      variant="outline"
      className={`flex items-center gap-2 bg-[#151126] border-[#2c1e4d] border-1 max-w-72 justify-start h-auto p-3 ${className}`}
      onClick={onClick}
    >
      <Server size={20} />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">{displayName}</span>
        {displayVersion && <span className="text-xs text-muted-foreground">{displayVersion}</span>}
      </div>
    </Button>
  )
}
