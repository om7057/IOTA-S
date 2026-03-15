import { logger } from '../utils/logger.js';
import { User, Conversation, DirectMessage, GroupChat, Group, GroupMember } from '../models/index.js';

/**
 * Socket.io Event Handlers for Real-time Features
 * Manages: Presence, Typing Indicators, Live Messaging, Notifications
 */

export const initializeSocketEvents = (io) => {
  // ==================== User Presence ====================
  
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);
    
    // User comes online
    socket.on('user:online', async (userId) => {
      try {
        socket.userId = userId;
        socket.join(`user:${userId}`);
        socket.join('online-users');
        
        // Update user online status
        await User.update(
          { isOnline: true, lastSeenAt: new Date() },
          { where: { id: userId } }
        );
        
        // Notify all connected clients that user is online
        io.emit('presence:user-online', { userId, timestamp: new Date() });
        logger.debug(`User ${userId} marked as online`);
      } catch (error) {
        logger.error('Error handling user:online', { error: error.message, userId });
      }
    });
    
    // User goes offline
    socket.on('user:offline', async () => {
      if (!socket.userId) return;
      
      try {
        await User.update(
          { isOnline: false, lastSeenAt: new Date() },
          { where: { id: socket.userId } }
        );
        
        io.emit('presence:user-offline', { userId: socket.userId, timestamp: new Date() });
        logger.debug(`User ${socket.userId} marked as offline`);
      } catch (error) {
        logger.error('Error handling user:offline', { error: error.message, userId: socket.userId });
      }
    });

    // ==================== Direct Messaging ====================
    
    // User joins their direct message room
    socket.on('dm:join', (conversationId) => {
      try {
        socket.join(`conversation:${conversationId}`);
        logger.debug(`Socket ${socket.id} joined conversation:${conversationId}`);
      } catch (error) {
        logger.error('Error joining DM conversation', { error: error.message, conversationId });
      }
    });
    
    // User sends direct message
    socket.on('dm:send', async (data) => {
      try {
        const { conversationId, content, senderId, targetUserId } = data;
        
        // Verify user is part of conversation
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Create message in database
        const message = await DirectMessage.create({
          conversationId,
          senderId,
          content,
        });
        
        // Update conversation lastMessageAt
        await conversation.update({ lastMessageAt: new Date(), messageCount: conversation.messageCount + 1 });
        
        // Emit to all users in conversation
        io.to(`conversation:${conversationId}`).emit('dm:message-received', {
          id: message.id,
          conversationId,
          senderId,
          content,
          isRead: false,
          createdAt: message.createdAt,
        });
        
        // Notify target user
        io.to(`user:${targetUserId}`).emit('notification:new-message', {
          type: 'direct_message',
          senderId,
          conversationId,
          preview: content.substring(0, 50),
          timestamp: new Date(),
        });
        
        logger.debug(`DM sent in conversation ${conversationId}`);
      } catch (error) {
        logger.error('Error sending direct message', { error: error.message, data });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Mark message as read
    socket.on('dm:mark-read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        
        await DirectMessage.update(
          { isRead: true, readAt: new Date() },
          { where: { id: messageId } }
        );
        
        io.to(`conversation:${conversationId}`).emit('dm:message-read', { messageId });
        logger.debug(`Message ${messageId} marked as read`);
      } catch (error) {
        logger.error('Error marking message as read', { error: error.message });
      }
    });
    
    // Typing indicator in DM
    socket.on('dm:typing', (data) => {
      try {
        const { conversationId, userId } = data;
        socket.to(`conversation:${conversationId}`).emit('dm:user-typing', { userId });
      } catch (error) {
        logger.error('Error emitting typing indicator', { error: error.message });
      }
    });
    
    // Stop typing in DM
    socket.on('dm:stop-typing', (data) => {
      try {
        const { conversationId, userId } = data;
        socket.to(`conversation:${conversationId}`).emit('dm:user-stopped-typing', { userId });
      } catch (error) {
        logger.error('Error emitting stop typing', { error: error.message });
      }
    });

    // ==================== Group Chat ====================
    
    // User joins group chat
    socket.on('group:join', (groupId) => {
      try {
        socket.join(`group:${groupId}`);
        io.to(`group:${groupId}`).emit('group:user-joined', { userId: socket.userId, timestamp: new Date() });
        logger.debug(`Socket ${socket.id} joined group:${groupId}`);
      } catch (error) {
        logger.error('Error joining group chat', { error: error.message, groupId });
      }
    });
    
    // User leaves group chat
    socket.on('group:leave', (groupId) => {
      try {
        socket.leave(`group:${groupId}`);
        io.to(`group:${groupId}`).emit('group:user-left', { userId: socket.userId, timestamp: new Date() });
        logger.debug(`Socket ${socket.id} left group:${groupId}`);
      } catch (error) {
        logger.error('Error leaving group chat', { error: error.message, groupId });
      }
    });
    
    // User sends group chat message
    socket.on('group:send-message', async (data) => {
      try {
        const { groupId, content, senderId, type = 'text' } = data;
        
        // Verify sender is group member
        const member = await GroupMember.findOne({ where: { groupId, userId: senderId } });
        if (!member) {
          socket.emit('error', { message: 'Not a member of this group' });
          return;
        }
        
        // Create message
        const message = await GroupChat.create({
          groupId,
          senderId,
          content,
          type,
        });
        
        // Update group lastActivityAt
        await Group.update({ lastActivityAt: new Date() }, { where: { id: groupId } });
        
        // Broadcast to all group members
        io.to(`group:${groupId}`).emit('group:message-received', {
          id: message.id,
          groupId,
          senderId,
          content,
          type,
          createdAt: message.createdAt,
        });
        
        logger.debug(`Group message sent to group ${groupId}`);
      } catch (error) {
        logger.error('Error sending group message', { error: error.message, data });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Edit group message
    socket.on('group:edit-message', async (data) => {
      try {
        const { messageId, groupId, content, senderId } = data;
        
        const message = await GroupChat.findByPk(messageId);
        if (!message || message.senderId !== senderId) {
          socket.emit('error', { message: 'Unauthorized to edit this message' });
          return;
        }
        
        await message.update({ content, isEdited: true, editedAt: new Date() });
        
        io.to(`group:${groupId}`).emit('group:message-edited', {
          messageId,
          content,
          editedAt: message.editedAt,
        });
        
        logger.debug(`Group message ${messageId} edited`);
      } catch (error) {
        logger.error('Error editing group message', { error: error.message });
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });
    
    // Delete group message
    socket.on('group:delete-message', async (data) => {
      try {
        const { messageId, groupId, userId } = data;
        
        const message = await GroupChat.findByPk(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }
        
        // Check permissions (sender, moderator, owner)
        const member = await GroupMember.findOne({ where: { groupId, userId } });
        if (message.senderId !== userId && (!member || !['moderator', 'owner'].includes(member.role))) {
          socket.emit('error', { message: 'Unauthorized to delete this message' });
          return;
        }
        
        await message.destroy();
        
        io.to(`group:${groupId}`).emit('group:message-deleted', { messageId });
        logger.debug(`Group message ${messageId} deleted`);
      } catch (error) {
        logger.error('Error deleting group message', { error: error.message });
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });
    
    // Typing indicator in group
    socket.on('group:typing', (data) => {
      try {
        const { groupId, userId } = data;
        socket.to(`group:${groupId}`).emit('group:user-typing', { userId });
      } catch (error) {
        logger.error('Error emitting group typing indicator', { error: error.message });
      }
    });
    
    // Stop typing in group
    socket.on('group:stop-typing', (data) => {
      try {
        const { groupId, userId } = data;
        socket.to(`group:${groupId}`).emit('group:user-stopped-typing', { userId });
      } catch (error) {
        logger.error('Error emitting group stop typing', { error: error.message });
      }
    });

    // ==================== Discussion Thread Updates ====================
    
    // User joins discussion
    socket.on('discussion:join', (discussionId) => {
      try {
        socket.join(`discussion:${discussionId}`);
        logger.debug(`Socket ${socket.id} joined discussion:${discussionId}`);
      } catch (error) {
        logger.error('Error joining discussion', { error: error.message, discussionId });
      }
    });
    
    // User leaves discussion
    socket.on('discussion:leave', (discussionId) => {
      try {
        socket.leave(`discussion:${discussionId}`);
        logger.debug(`Socket ${socket.id} left discussion:${discussionId}`);
      } catch (error) {
        logger.error('Error leaving discussion', { error: error.message, discussionId });
      }
    });
    
    // New reply posted to discussion
    socket.on('discussion:new-reply', async (data) => {
      try {
        const { discussionId, replyId, userId, content, parentReplyId } = data;
        
        io.to(`discussion:${discussionId}`).emit('discussion:reply-received', {
          replyId,
          discussionId,
          userId,
          content,
          parentReplyId,
          timestamp: new Date(),
        });
        
        logger.debug(`New reply to discussion ${discussionId}`);
      } catch (error) {
        logger.error('Error broadcasting new reply', { error: error.message });
      }
    });
    
    // Reply liked
    socket.on('discussion:reply-liked', (data) => {
      try {
        const { discussionId, replyId, userId, likeCount } = data;
        
        io.to(`discussion:${discussionId}`).emit('discussion:reply-like-updated', {
          replyId,
          likeCount,
          userId,
        });
        
        logger.debug(`Reply ${replyId} like count updated`);
      } catch (error) {
        logger.error('Error broadcasting reply like', { error: error.message });
      }
    });

    // ==================== Connection Management ====================
    
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          await User.update(
            { isOnline: false, lastSeenAt: new Date() },
            { where: { id: socket.userId } }
          );
          io.emit('presence:user-offline', { userId: socket.userId, timestamp: new Date() });
        }
        logger.info(`User disconnected: ${socket.id}`);
      } catch (error) {
        logger.error('Error handling disconnect', { error: error.message, socketId: socket.id });
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { error: error.message, socketId: socket.id });
    });
  });
};

export default initializeSocketEvents;
