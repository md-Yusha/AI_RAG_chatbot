import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
    <div className="w-full max-w-md p-4 flex items-center justify-center">
      <SignUp
        routing="path"
        path="/signup"
        afterSignUpUrl="/chat"
        afterSignInUrl="/chat"
      />
    </div>
  </div>
);

export default SignUpPage;
