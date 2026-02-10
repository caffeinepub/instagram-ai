import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FeedPageProps {
  onNavigateToProfile: (principalId: string) => void;
}

export default function FeedPage({ onNavigateToProfile }: FeedPageProps) {
  const { data: posts, isLoading, error } = useGetAllPosts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load posts. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img
          src="/assets/generated/empty-feed-illustration.dim_1200x800.png"
          alt="No posts yet"
          className="w-full max-w-md mb-6 opacity-80"
        />
        <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
        <p className="text-muted-foreground mb-6">
          Be the first to share something! Click the + button to create a post.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {posts.map((post) => (
        <PostCard key={post.id.toString()} post={post} onNavigateToProfile={onNavigateToProfile} />
      ))}
    </div>
  );
}
