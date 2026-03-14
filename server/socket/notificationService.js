import { logger } from '../utils/logger.js';

/**
 * Notification Service
 * Handles in-app notifications, mentions, and alerts
 */

export class NotificationService {
  constructor(io) {
    this.io = io;
  }
  
  /**
   * Send notification to specific user
   */
  notifyUser(userId, notification) {
    const notificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date(),
    };
    
    this.io.to(`user:${userId}`).emit('notification:received', notificationData);
    logger.debug(`Notification sent to user ${userId}:`, notificationData.type);
    return notificationData;
  }
  
  /**
   * Send notification to multiple users
   */
  notifyUsers(userIds, notification) {
    const notifications = [];
    for (const userId of userIds) {
      notifications.push(this.notifyUser(userId, notification));
    }
    return notifications;
  }
  
  /**
   * Notify group members about new message
   */
  notifyGroupMessage(groupId, groupName, senderId, senderName, messagePreview, excludeUserId) {
    const notification = {
      type: 'group_message',
      groupId,
      senderId,
      title: `Message from ${senderName} in ${groupName}`,
      message: messagePreview,
      action: `group_message:${groupId}`,
    };
    
    this.io.to(`group:${groupId}`).emit('notification:group-message', notification);
    logger.debug(`Group message notification sent for group ${groupId}`);
  }
  
  /**
   * Notify user about direct message
   */
  notifyDirectMessage(userId, senderId, senderName, messagePreview, conversationId) {
    const notification = {
      type: 'direct_message',
      senderId,
      conversationId,
      title: `Message from ${senderName}`,
      message: messagePreview,
      action: `dm:${conversationId}`,
    };
    
    this.notifyUser(userId, notification);
  }
  
  /**
   * Notify mentioned users in discussion or group
   */
  notifyMentions(mentionedUserIds, mentioner, mentionType, contextId, contextPreview) {
    const notification = {
      type: 'mention',
      mentioner,
      mentionType, // 'discussion', 'reply', 'group_message'
      contextId,
      title: `${mentioner} mentioned you`,
      message: contextPreview,
      action: `mention:${mentionType}:${contextId}`,
    };
    
    for (const userId of mentionedUserIds) {
      this.notifyUser(userId, notification);
    }
  }
  
  /**
   * Notify likes on content
   */
  notifyLike(userId, likerId, likerName, contentType, contentId, contentPreview) {
    const notification = {
      type: 'like',
      likerId,
      contentType, // 'discussion', 'reply', 'post'
      contentId,
      title: `${likerName} liked your ${contentType}`,
      message: contentPreview,
      action: `like:${contentType}:${contentId}`,
    };
    
    this.notifyUser(userId, notification);
  }
  
  /**
   * Notify new discussion in group
   */
  notifyNewDiscussion(groupId, groupName, discussionId, creatorName, discussionTitle) {
    const notification = {
      type: 'new_discussion',
      groupId,
      discussionId,
      title: `New discussion in ${groupName}`,
      message: `${creatorName}: ${discussionTitle}`,
      action: `discussion:${discussionId}`,
    };
    
    this.io.to(`group:${groupId}`).emit('notification:new-discussion', notification);
  }
  
  /**
   * Notify new reply to discussion
   */
  notifyNewReply(discussionId, replyId, replierName, replyPreview) {
    const notification = {
      type: 'new_reply',
      discussionId,
      replyId,
      title: `New reply from ${replierName}`,
      message: replyPreview,
      action: `reply:${replyId}`,
    };
    
    this.io.to(`discussion:${discussionId}`).emit('notification:new-reply', notification);
  }
  
  /**
   * Notify user joined group
   */
  notifyUserJoinedGroup(groupId, groupName, userId, userName) {
    const notification = {
      type: 'user_joined',
      groupId,
      userId,
      title: `${userName} joined ${groupName}`,
      message: `Welcome ${userName}!`,
    };
    
    this.io.to(`group:${groupId}`).emit('notification:user-joined', notification);
  }
  
  /**
   * Send error notification to user
   */
  notifyError(userId, errorMessage, errorCode) {
    const notification = {
      type: 'error',
      title: 'Error',
      message: errorMessage,
      code: errorCode,
    };
    
    this.notifyUser(userId, notification);
  }
  
  /**
   * Send system-wide notification
   */
  broadcastSystemNotification(message, priority = 'info') {
    const notification = {
      type: 'system',
      title: 'System Notification',
      message,
      priority, // 'info', 'warning', 'critical'
    };
    
    this.io.emit('notification:system', notification);
    logger.info(`System notification broadcast: ${message}`);
  }
}

export default NotificationService;
