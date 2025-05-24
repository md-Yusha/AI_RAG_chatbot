import {
  ClerkProvider as ClerkProviderBase,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Get the Clerk publishable key from Vite environment variables
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_a2Vlbi1yZWRmaXNoLTMwLmNsZXJrLmFjY291bnRzLmRldiQ';

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

export function ClerkProvider({ children }) {
  const navigate = useNavigate();

  return (
    <ClerkProviderBase
      publishableKey={clerkPubKey}
      navigate={to => navigate(to)}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}

export function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
