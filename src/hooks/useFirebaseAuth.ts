import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signIn, signUp, signInWithGoogle, logOut } from '../utils/auth';
import toast from 'react-hot-toast';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await signIn(email, password);
      toast.success('Successfully signed in!');
      return user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await signUp(email, password);
      toast.success('Account created! Please check your email for verification.');
      return user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      return user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    logOut: handleLogOut
  };
}