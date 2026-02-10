import { useState } from 'react';
import { useSearchProfiles } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useDebounce } from 'react-use';

interface SearchPageProps {
  onNavigateToProfile: (principalId: string) => void;
}

export default function SearchPage({ onNavigateToProfile }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    300,
    [searchTerm]
  );

  const { data: profiles, isLoading } = useSearchProfiles(debouncedSearchTerm);

  return (
    <div className="space-y-6 pb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {debouncedSearchTerm ? 'No users found' : 'Search for users to connect with'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <Card
              key={profile.id.toString()}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onNavigateToProfile(profile.id.toString())}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/assets/generated/default-avatar.dim_256x256.png" />
                    <AvatarFallback>{profile.displayName[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{profile.displayName}</p>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {Number(profile.postsCount)} posts · {Number(profile.followersCount)} followers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
