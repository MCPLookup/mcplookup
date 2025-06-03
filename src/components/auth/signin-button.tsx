// Sign In Button Component
// Simple authentication button

'use client';

export function SignInButton() {
  const handleSignIn = () => {
    // For now, just a placeholder
    console.log('Sign in clicked');
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Sign In
    </button>
  );
}

export default SignInButton;
