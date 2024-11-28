import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    let message = 'Failed to sign in';
    switch (error.code) {
      case 'auth/invalid-credential':
        message = 'Invalid email or password';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      default:
        message = error.message;
    }
    throw new Error(message);
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    return result.user;
  } catch (error: any) {
    let message = 'Failed to create account';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already in use. Please sign in instead.';
    }
    throw new Error(message);
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    let message = 'Failed to sign in with Google';
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        message = 'Sign in cancelled';
        break;
      case 'auth/popup-blocked':
        message = 'Popup was blocked. Please allow popups for this site.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message;
    }
    throw new Error(message);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};