import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { getColors } from '../../theme';
import AuthForm from './AuthForm';
import AccountView from './AccountView';

/**
 * Main Account Component
 * Handles authentication state and routes to appropriate view
 */
const Account = ({ isDarkMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  const colors = getColors(isDarkMode);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await currentUser.reload();
        setIsEmailVerified(currentUser.emailVerified);
      } else {
        setIsEmailVerified(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user profile data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoadingUserData(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        background: colors.mainBg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.text }}>Loading...</div>
      </div>
    );
  }

  // Show account view if logged in, auth form if not
  return user ? (
    <AccountView 
      isDarkMode={isDarkMode}
      user={user}
      userData={userData}
      isEmailVerified={isEmailVerified}
      onUserDataUpdate={setUserData}
    />
  ) : (
    <AuthForm isDarkMode={isDarkMode} />
  );
};

export default Account;