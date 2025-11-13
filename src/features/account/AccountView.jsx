import React, { useState } from 'react';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { getColors } from '../../theme';
import AccountHeader from './AccountHeader';
import AccountBanners from './AccountBanners';
import AccountInfoCard from './AccountInfoCard';
import AccountActions from './AccountActions';
import EditProfile from './EditProfile';
import DeleteAccountModal from './DeleteAccountModal';

/**
 * Account View Component
 * Displays user account when logged in
 */
const AccountView = ({ 
  isDarkMode, 
  user, 
  userData, 
  isEmailVerified,
  onUserDataUpdate 
}) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const colors = getColors(isDarkMode);

  // Check if profile is incomplete
  const isProfileIncomplete = !userData?.displayName || !userData?.phone || !userData?.company;

  const handleResendVerification = async () => {
    if (!user) return;
    
    setSendingVerification(true);
    setError('');
    setSuccess('');

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      setSuccess(`Verification email sent to ${user.email}! Check your inbox.`);
      setTimeout(() => setSuccess(''), 8000);
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError(`Failed to send verification email: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div style={{ 
        background: colors.mainBg,
        paddingBottom: '5rem',
        minHeight: '100vh'
      }}>
        <div style={{ padding: '1rem' }}>
          {/* Banners (Email Verification, Profile Incomplete, Success/Error) */}
          <AccountBanners
            isEmailVerified={isEmailVerified}
            isProfileIncomplete={isProfileIncomplete}
            sendingVerification={sendingVerification}
            success={success}
            error={error}
            onResendVerification={handleResendVerification}
          />

          {/* Account Header with Avatar */}
          <AccountHeader
            user={user}
            userData={userData}
            isEmailVerified={isEmailVerified}
            isDarkMode={isDarkMode}
          />

          {/* Account Information Card */}
          <AccountInfoCard
            user={user}
            userData={userData}
            isDarkMode={isDarkMode}
            onEditProfile={() => setShowEditProfile(true)}
          />

          {/* Actions (Sign Out, Delete Account) */}
          <AccountActions
            isDarkMode={isDarkMode}
            onLogout={handleLogout}
            onDeleteAccount={() => setShowDeleteAccount(true)}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          isDarkMode={isDarkMode}
          userData={userData}
          onUpdate={async (updatedData) => {
            // Reload the current user to get updated photoURL
            if (user) {
              await user.reload();
            }
            onUserDataUpdate(updatedData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <DeleteAccountModal
          isOpen={showDeleteAccount}
          onClose={() => setShowDeleteAccount(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default AccountView;