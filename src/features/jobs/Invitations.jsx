import React from 'react';
import InvitationInbox from './InvitationInbox';

const Invitations = ({ isDarkMode, colors, onInvitationAccepted, onRefresh }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 70px)'
    }}>
      <InvitationInbox
        isDarkMode={isDarkMode}
        colors={colors}
        onInvitationAccepted={onInvitationAccepted}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default Invitations;