import { useState } from 'react';
import { useAddComment, useGetProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { Post } from '../backend';
import { formatDistanceToNow } from 'date-fns';

interface PostCommentsDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToProfile: (principalId: string) => void;
}

export default function PostCommentsDialog({
  post,
  open,
  onOpenChange,
  onNavigateToProfile,
}: PostCommentsDialogProps) {
  const [commentText, setCommentText] = useState('');
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await addComment.mutateAsync({
      postId: post.id,
      text: commentText.trim(),
    });
    setCommentText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              post.comments.map((comment, index) => (
                <CommentItem
                  key={index}
                  comment={comment}
                  onNavigateToProfile={onNavigateToProfile}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={addComment.isPending}
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!commentText.trim() || addComment.isPending}
            className="bg-coral hover:bg-coral-dark"
          >
            {addComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CommentItemProps {
  comment: { author: any; text: string; timestamp: bigint };
  onNavigateToProfile: (principalId: string) => void;
}

function CommentItem({ comment, onNavigateToProfile }: CommentItemProps) {
  const { data: authorProfile } = useGetProfile(comment.author.toString());
  const timestamp = new Date(Number(comment.timestamp) / 1000000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className="flex gap-3">
      <Avatar
        className="h-8 w-8 cursor-pointer"
        onClick={() => onNavigateToProfile(comment.author.toString())}
      >
        <AvatarImage src="/assets/generated/default-avatar.dim_256x256.png" />
        <AvatarFallback>{authorProfile?.displayName?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="font-semibold text-sm cursor-pointer hover:text-coral"
            onClick={() => onNavigateToProfile(comment.author.toString())}
          >
            {authorProfile?.displayName || 'Loading...'}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm mt-1">{comment.text}</p>
      </div>
    </div>
  );
}
