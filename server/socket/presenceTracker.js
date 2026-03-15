import { User } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Presence Tracking Service
 * Manages user online/offline status and last seen timestamps
 */

export class PresenceTracker {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> Set of socket IDs
    this.socketUsers = new Map(); // socketId -> userId
  }
  
  /**
   * Register a user socket connection
   */
  registerSocket(socketId, userId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
    this.socketUsers.set(socketId, userId);
    logger.debug(`Socket ${socketId} registered for user ${userId}`);
  }
  
  /**
   * Unregister a user socket connection
   */
  unregisterSocket(socketId) {
    const userId = this.socketUsers.get(socketId);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(socketId);
      logger.debug(`Socket ${socketId} unregistered for user ${userId}`);
    }
  }
  
  /**
   * Check if user is currently online
   */
  isUserOnline(userId) {
    const sockets = this.userSockets.get(userId);
    return sockets && sockets.size > 0;
  }
  
  /**
   * Get all online users
   */
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }
  
  /**
   * Get socket count for user
   */
  getUserSocketCount(userId) {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size : 0;
  }
  
  /**
   * Broadcast presence update to all connected clients
   */
  broadcastPresenceUpdate(userId, isOnline) {
    this.io.emit('presence:updated', {
      userId,
      isOnline,
      timestamp: new Date(),
    });
  }
  
  /**
   * Get user presence status with multiple users
   */
  async getPresenceStatus(userIds) {
    const status = {};
    for (const userId of userIds) {
      status[userId] = {
        isOnline: this.isUserOnline(userId),
        socketCount: this.getUserSocketCount(userId),
      };
    }
    return status;
  }
}

export default PresenceTracker;
