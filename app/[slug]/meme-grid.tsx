"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MemeGridProps {
  slug: string
}

export function MemeGrid({ slug }: MemeGridProps) {
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null)

  // This would come from your database
  const memes = [
    {
      id: "1",
      url: "/api/placeholder/400/400",
      type: "image",
      title: "Original Dogwifhat",
    },
    // Add more memes
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {memes.map((meme) => (
        <Card key={meme.id} className="overflow-hidden">
          <CardContent className="p-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto hover:opacity-90">
                  <img
                    src={meme.url}
                    alt={meme.title}
                    className="w-full h-auto aspect-square object-cover"
                  />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{meme.title}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <img
                    src={meme.url}
                    alt={meme.title}
                    className="max-h-[80vh] w-auto"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}