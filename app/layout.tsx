// File: /app/layout.tsx
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MemecoinContent - The Ultimate Memecoin Content Directory",
  description: "Discover and share the best memes for your favorite memecoins. Your one-stop hub for memecoin culture.",
  keywords: ["memecoin", "crypto", "memes", "dogwifhat", "pepe", "cryptocurrency"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}