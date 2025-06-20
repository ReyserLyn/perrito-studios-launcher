import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export const LaunchButton = () => {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 bg-[#151126] border-[#2c1e4d] border-1 max-w-80 justify-start h-auto"
      effect="shineHover"
    >
      <Play size={25} />
      <span className="text-xl font-medium">Play</span>
    </Button>
  )
}
