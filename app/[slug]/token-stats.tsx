import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"

interface TokenStatsProps {
  price: number
  holders: number
  marketCap: number
}

export function TokenStats({ price, holders, marketCap }: TokenStatsProps) {
  const priceChange = 5.2 // This would come from API

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Price</div>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">${price.toFixed(3)}</div>
              <div className={`ml-2 flex items-center text-sm ${
                priceChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {priceChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(priceChange)}%
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Holders</div>
            <div className="text-2xl font-bold">
              {holders.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
            <div className="text-2xl font-bold">
              ${marketCap.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
