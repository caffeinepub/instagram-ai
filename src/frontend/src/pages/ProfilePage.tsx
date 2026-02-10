import { useGetProfile, useGetPostsByUser, useFollowUser, useUnfollowUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus, UserMinus, Settings } from 'lucide-react';
import { useState } from 'react';
import EditProfileDialog from '../components/EditProfileDialog';

interface ProfilePageProps {
  principalId: string;
  onNavigateToProfile: (principalId: string) => void;
}

export default function ProfilePage({ principalId, onNavigateToProfile }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(principalId);
  const { data: posts, isLoading: postsLoading } = useGetPostsByUser(principalId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = currentUserPrincipal === principalId;

  const handleFollow = async () => {
    await followUser.mutateAsync(principalId);
  };

  const handleUnfollow = async () => {
    await unfollowUser.mutateAsync(principalId);
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load profile. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/assets/generated/default-avatar.dim_256x256.png" />
            <AvatarFallback className="text-2xl">{profile.displayName[0] || '?'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={followUser.isPending}
                  className="gap-2 bg-coral hover:bg-coral-dark"
                >
                  <UserPlus className="h-4 w-4" />
                  Follow
                </Button>
              )}
            </div>

            <div className="flex justify-center sm:justify-start gap-6 mb-4">
              <div className="text-center">
                <p className="font-bold">{Number(profile.postsCount)}</p>
                <p className="text-sm text-muted-foreground">posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{Number(profile.followersCount)}</p>
                <p className="text-sm text-muted-foreground">followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{Number(profile.followingCount)}</p>
                <p className="text-sm text-muted-foreground">following</p>
              </div>
            </div>

            {profile.bio && <p className="text-sm">{profile.bio}</p>}
          </div>
        </div>

        {/* Posts Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Posts</h2>
          {postsLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div key={post.id.toString()} className="aspect-square overflow-hidden">
                  <img
                    src={post.image.getDirectURL()}
                    alt={post.caption}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileDialog
          open={showEditProfile}
          onOpenChange={setShowEditProfile}
          currentProfile={profile}
        />
      )}
    </>
  );
}
