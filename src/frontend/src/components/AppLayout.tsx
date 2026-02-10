import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Home, Search, User, PlusSquare, LogOut } from 'lucide-react';
import { useState } from 'react';
import NewPostDialog from './NewPostDialog';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'feed' | 'search' | 'profile';
  onNavigateToFeed: () => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: () => void;
}

export default function AppLayout({
  children,
  currentView,
  onNavigateToFeed,
  onNavigateToSearch,
  onNavigateToProfile,
}: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateToFeed}>
            <img
              src="/assets/generated/instagram-ai-logo.dim_512x512.png"
              alt="logo"
              className="h-8 w-8"
            />
            <img
              src="/assets/generated/instagram-ai-wordmark.dim_1200x300.png"
              alt="instagram ai"
              className="h-6 hidden sm:block"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewPost(true)}
              className="text-foreground hover:text-coral hover:bg-coral/10"
            >
              <PlusSquare className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 z-50 w-full border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToFeed}
            className={currentView === 'feed' ? 'text-coral' : 'text-muted-foreground'}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToSearch}
            className={currentView === 'search' ? 'text-coral' : 'text-muted-foreground'}
          >
            <Search className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToProfile}
            className={currentView === 'profile' ? 'text-coral' : 'text-muted-foreground'}
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <div className="hidden md:block fixed left-4 top-24 space-y-2">
        <Button
          variant={currentView === 'feed' ? 'default' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={onNavigateToFeed}
        >
          <Home className="h-5 w-5" />
          <span>Feed</span>
        </Button>
        <Button
          variant={currentView === 'search' ? 'default' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={onNavigateToSearch}
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Button>
        <Button
          variant={currentView === 'profile' ? 'default' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={onNavigateToProfile}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Button>
      </div>

      <NewPostDialog open={showNewPost} onOpenChange={setShowNewPost} />
    </div>
  );
}
