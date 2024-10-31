import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          Welcome to MemecoinContent
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Your ultimate directory for memecoin content
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/explore">
              Explore Memecoins
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}