import {auth} from './firebaseConfig';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged  // Add this import
} from 'firebase/auth';

// Fix the typo in the parameter
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Add missing import and make async
export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Add missing import and make async
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// Add Apple sign-in function
export const doSignInWithApple = async () => {
  // Note: Apple sign-in requires additional setup in Firebase
  // This is a placeholder - you need to implement Apple Auth Provider
  throw new Error('Apple sign-in not implemented yet');
  // For Apple sign-in, you would use:
  // import { OAuthProvider } from 'firebase/auth';
  // const provider = new OAuthProvider('apple.com');
  // return signInWithPopup(auth, provider);
};

export const doSignOut = () => {
    return auth.signOut();
};

// Export onAuthStateChanged
export { onAuthStateChanged };

/* export const doPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const doPasswordUpdate = (password) => {
    return currentUser.updatePassword(password);
};

export const doSendEmailVerification = () => {
    return currentUser.sendEmailVerification({
        url: `${window.location.origin}/login`,
    });
}; */