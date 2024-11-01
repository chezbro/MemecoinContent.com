// File: /app/[slug]/twitter-feed.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { searchTweets } from "@/lib/twitter"
import { Tweet } from "@/lib/types"
import { HeartIcon, RepeatIcon, MessageCircleIcon } from "lucide-react"

interface TwitterFeedProps {
  slug: string
}

export async function TwitterFeed({ slug }: TwitterFeedProps) {
  const query = `${slug} memecoin filter:media -is:retweet`

  try {
    const response = await searchTweets(query);
    
    if (!response.data || response.data.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No tweets found</p>
          </CardContent>
        </Card>
      );
    }

    const getUserData = (authorId: string) => {
      return response.includes?.users.find(user => user.id === authorId);
    };

    return (
      <>
        <div className="space-y-4">
          {response.data.map((tweet) => {
            const author = getUserData(tweet.author_id);
            
            if (!author) return null;

            return (
              <Card key={tweet.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <img
                      src={author.profile_image_url}
                      alt={author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{author.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{author.username}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{tweet.text}</p>
                  <div className="flex space-x-6 text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MessageCircleIcon className="w-4 h-4" />
                      <span>{tweet.public_metrics?.reply_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RepeatIcon className="w-4 h-4" />
                      <span>{tweet.public_metrics?.retweet_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-4 h-4" />
                      <span>{tweet.public_metrics?.like_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching tweets:', error);
    
    let errorMessage = 'Temporarily unable to load tweets. Please try again in a few minutes.';
    
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        errorMessage = 'Twitter rate limit reached. Please try again in a few minutes.';
      } else if (error.message.includes('fetch failed')) {
        errorMessage = 'Unable to connect to Twitter. Please check your connection and try again.';
      }
    }
    
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }
}