import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCurrentProfile } from './hooks/useQueries';
import SignInPage from './pages/SignInPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import AppLayout from './components/AppLayout';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [currentView, setCurrentView] = useState<'feed' | 'search' | 'profile'>('feed');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCurrentProfile();

  // Show sign-in page if not authenticated
  if (!isAuthenticated) {
    return <SignInPage />;
  }

  // Show loading state while checking profile
  if (loginStatus === 'initializing' || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Show profile setup if user has no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleNavigateToProfile = (principalId: string) => {
    setViewingProfileId(principalId);
    setCurrentView('profile');
  };

  const handleNavigateToFeed = () => {
    setCurrentView('feed');
    setViewingProfileId(null);
  };

  const handleNavigateToSearch = () => {
    setCurrentView('search');
    setViewingProfileId(null);
  };

  const handleNavigateToMyProfile = () => {
    if (identity) {
      setViewingProfileId(identity.getPrincipal().toString());
      setCurrentView('profile');
    }
  };

  return (
    <>
      <AppLayout
        currentView={currentView}
        onNavigateToFeed={handleNavigateToFeed}
        onNavigateToSearch={handleNavigateToSearch}
        onNavigateToProfile={handleNavigateToMyProfile}
      >
        {currentView === 'feed' && <FeedPage onNavigateToProfile={handleNavigateToProfile} />}
        {currentView === 'search' && <SearchPage onNavigateToProfile={handleNavigateToProfile} />}
        {currentView === 'profile' && viewingProfileId && (
          <ProfilePage principalId={viewingProfileId} onNavigateToProfile={handleNavigateToProfile} />
        )}
      </AppLayout>

      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}
