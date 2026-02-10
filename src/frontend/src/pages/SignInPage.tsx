import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral-50 via-background to-peach-50 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-6">
          <img
            src="/assets/generated/instagram-ai-logo.dim_512x512.png"
            alt="instagram ai logo"
            className="w-24 h-24 mx-auto"
          />
          <img
            src="/assets/generated/instagram-ai-wordmark.dim_1200x300.png"
            alt="instagram ai"
            className="w-64 mx-auto"
          />
          <p className="text-muted-foreground text-lg">
            Share moments, connect with friends, and discover inspiring content.
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full max-w-xs bg-coral hover:bg-coral-dark text-white font-semibold shadow-lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to continue'
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          Secure authentication powered by Internet Identity
        </p>
      </div>
    </div>
  );
}
