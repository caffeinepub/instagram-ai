import { useState } from 'react';
import { useGetProfile, useLikePost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../backend';
import PostCommentsDialog from './PostCommentsDialog';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onNavigateToProfile: (principalId: string) => void;
}

export default function PostCard({ post, onNavigateToProfile }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { data: authorProfile } = useGetProfile(post.author.toString());
  const likePost = useLikePost();
  const [showComments, setShowComments] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLikedByUser = post.likes.some((p) => p.toString() === currentUserPrincipal);
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;

  const handleLike = async () => {
    await likePost.mutateAsync(post.id);
  };

  const timestamp = new Date(Number(post.timestamp) / 1000000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <>
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={() => onNavigateToProfile(post.author.toString())}
            >
              <AvatarImage src="/assets/generated/default-avatar.dim_256x256.png" />
              <AvatarFallback>{authorProfile?.displayName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p
                className="font-semibold text-sm cursor-pointer hover:text-coral"
                onClick={() => onNavigateToProfile(post.author.toString())}
              >
                {authorProfile?.displayName || 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <img
            src={post.image.getDirectURL()}
            alt={post.caption}
            className="w-full aspect-square object-cover"
          />
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-3 p-4">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLikedByUser ? 'text-coral hover:text-coral' : ''}`}
              onClick={handleLike}
              disabled={likePost.isPending}
            >
              <Heart className={`h-5 w-5 ${isLikedByUser ? 'fill-coral' : ''}`} />
              <span className="font-semibold">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{commentsCount}</span>
            </Button>
          </div>

          {post.caption && (
            <div className="text-sm">
              <span
                className="font-semibold cursor-pointer hover:text-coral mr-2"
                onClick={() => onNavigateToProfile(post.author.toString())}
              >
                {authorProfile?.displayName}
              </span>
              <span>{post.caption}</span>
            </div>
          )}

          {commentsCount > 0 && (
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(true)}
            >
              View all {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
            </button>
          )}
        </CardFooter>
      </Card>

      <PostCommentsDialog
        post={post}
        open={showComments}
        onOpenChange={setShowComments}
        onNavigateToProfile={onNavigateToProfile}
      />
    </>
  );
}
