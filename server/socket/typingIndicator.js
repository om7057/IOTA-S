import { logger } from '../utils/logger.js';

/**
 * Typing Indicators Service
 * Manages and broadcasts typing status in conversations and groups
 */

export class TypingIndicator {
  constructor(io) {
    this.io = io;
    this.typingUsers = new Map(); // roomId -> Set of typing users
    this.typingTimeouts = new Map(); // roomId:userId -> timeout ID
  }
  
  /**
   * Mark user as typing in a conversation
   */
  setTyping(roomId, userId) {
    // Create room typing set if not exists
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    
    this.typingUsers.get(roomId).add(userId);
    
    // Clear existing timeout for this user in this room
    const timeoutKey = `${roomId}:${userId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
    }
    
    // Auto-clear typing status after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      this.clearTyping(roomId, userId);
    }, 3000);
    
    this.typingTimeouts.set(timeoutKey, timeout);
    
    // Broadcast typing status
    this.broadcastTypingStatus(roomId);
    logger.debug(`User ${userId} is typing in ${roomId}`);
  }
  
  /**
   * Mark user as stopped typing
   */
  clearTyping(roomId, userId) {
    const timeoutKey = `${roomId}:${userId}`;
    
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
      this.typingTimeouts.delete(timeoutKey);
    }
    
    if (this.typingUsers.has(roomId)) {
      this.typingUsers.get(roomId).delete(userId);
      
      // Clean up empty rooms
      if (this.typingUsers.get(roomId).size === 0) {
        this.typingUsers.delete(roomId);
      }
    }
    
    // Broadcast updated typing status
    this.broadcastTypingStatus(roomId);
    logger.debug(`User ${userId} stopped typing in ${roomId}`);
  }
  
  /**
   * Get list of users currently typing in a room
   */
  getTypingUsers(roomId) {
    const users = this.typingUsers.get(roomId);
    return users ? Array.from(users) : [];
  }
  
  /**
   * Broadcast current typing status for a room
   */
  broadcastTypingStatus(roomId) {
    const typingUsers = this.getTypingUsers(roomId);
    
    if (typingUsers.length > 0) {
      this.io.to(roomId).emit('typing:status', {
        roomId,
        typingUsers,
        count: typingUsers.length,
      });
    } else {
      // Emit empty typing status when no one is typing
      this.io.to(roomId).emit('typing:status', {
        roomId,
        typingUsers: [],
        count: 0,
      });
    }
  }
  
  /**
   * Handle user disconnect - clear all typing indicators
   */
  handleUserDisconnect(userId) {
    // Find all rooms where user was typing
    const roomsToClean = [];
    
    for (const [roomId, users] of this.typingUsers.entries()) {
      if (users.has(userId)) {
        roomsToClean.push(roomId);
      }
    }
    
    // Clear typing for all rooms
    for (const roomId of roomsToClean) {
      this.clearTyping(roomId, userId);
    }
    
    logger.debug(`Cleared typing indicators for user ${userId} from ${roomsToClean.length} rooms`);
  }
  
  /**
   * Format typing indicator message based on user count
   */
  formatTypingMessage(typingUsers) {
    if (typingUsers.length === 0) {
      return '';
    } else if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  }
  
  /**
   * Get statistics about typing activity
   */
  getTypingStats() {
    let totalRooms = 0;
    let totalTypingUsers = 0;
    
    for (const users of this.typingUsers.values()) {
      totalRooms++;
      totalTypingUsers += users.size;
    }
    
    return {
      totalRooms,
      totalTypingUsers,
      averagePerRoom: totalRooms > 0 ? (totalTypingUsers / totalRooms).toFixed(2) : 0,
    };
  }
}

export default TypingIndicator;
