import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { nanoUSDToString } from "@/lib/utils"
import type { WorkerBilling } from "billing-durable-object"
import { FiInfo } from "react-icons/fi"

export function CostTooltip({
  unitPriceNanoUSD,
  requestsPerUnit,
  includedRequests,
}: WorkerBilling["pricing"]) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <FiInfo />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{includedRequests.toString()} included requests</p>
          <p>
            + {nanoUSDToString(unitPriceNanoUSD)} /{" "}
            {requestsPerUnit.toLocaleString()} requests
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
