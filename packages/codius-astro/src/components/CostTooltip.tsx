import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FiInfo } from "react-icons/fi"

export function CostTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <FiInfo />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>$0.30 / million requests</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
