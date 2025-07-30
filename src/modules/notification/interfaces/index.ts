export interface BaseNotification {
  id: string;
  receiver: string;
  createdAt: Date;
  isRead: boolean;
}

export interface SocialNotification extends BaseNotification {
  type: 'social';
  payload: {
    action: 'friend-request' | 'post-like' | 'comment';
    senderId: string;
    // ... other social-specific fields
  };
}

export interface GameNotification extends BaseNotification {
  type: 'game';
  payload: {
    action: 'invite' | 'achievement' | 'match-result';
    gameId: string;
    // ... other game-specific fields
  };
}
