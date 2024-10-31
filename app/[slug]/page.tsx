import { Suspense } from "react"
import { notFound } from "next/navigation"
import { MemeGrid } from "./meme-grid"
import { TokenStats } from "./token-stats"
import { TwitterFeed } from "./twitter-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function MemecoinPage({ params }: PageProps) {
  // TODO: Fetch memecoin data from database
  const memecoin = {
    name: "Dogwifhat",
    symbol: "WIF",
    slug: "dogwifhat",
    description: "The dog with the hat that took crypto by storm",
    // This would come from an API
    price: 0.234,
    holders: 12500,
    marketCap: 45000000
  }

  if (!memecoin) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-1">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {memecoin.name}
            <span className="text-muted-foreground ml-2 text-2xl">
              ${memecoin.symbol}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {memecoin.description}
          </p>
        </div>
        <div className="w-full md:w-96">
          <TokenStats 
            price={memecoin.price}
            holders={memecoin.holders}
            marketCap={memecoin.marketCap}
          />
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="memes" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="memes">Memes</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        <TabsContent value="memes" className="mt-6">
          <Suspense fallback={<div>Loading memes...</div>}>
            <MemeGrid slug={params.slug} />
          </Suspense>
        </TabsContent>
        <TabsContent value="twitter" className="mt-6">
          <Suspense fallback={<div>Loading tweets...</div>}>
            <TwitterFeed slug={params.slug} />
          </Suspense>
        </TabsContent>
        <TabsContent value="info" className="mt-6">
          {/* Add detailed info component here */}
        </TabsContent>
      </Tabs>
    </main>
  )
}