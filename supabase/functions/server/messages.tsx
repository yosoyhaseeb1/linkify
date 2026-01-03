import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Helper to require org context (matches index.tsx pattern)
interface AuthContext {
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  email: string | null;
}

function requireOrg(c: any): AuthContext & { orgId: string } {
  const auth = c.get('auth') as AuthContext;
  if (!auth?.orgId) {
    throw new Error('Organization context required');
  }
  return auth as AuthContext & { orgId: string };
}

// Get all channels for an organization - SECURED
app.get('/channels/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channels = await kv.getByPrefix(`org:${verifiedOrgId}:channel:`);
    
    // If no channels exist, create default ones
    if (!channels || channels.length === 0) {
      const defaultChannels = [
        {
          id: 'general',
          name: 'general',
          description: 'General team discussion',
          type: 'channel',
          members: [],
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          isPrivate: false
        },
        {
          id: 'recruiting',
          name: 'recruiting',
          description: 'Recruitment strategies and updates',
          type: 'channel',
          members: [],
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          isPrivate: false
        }
      ];
      
      for (const channel of defaultChannels) {
        await kv.set(`org:${verifiedOrgId}:channel:${channel.id}`, channel);
      }
      
      return c.json({ channels: defaultChannels });
    }
    
    return c.json({ channels });
  } catch (err) {
    console.error('Error fetching channels:', err);
    return c.json({ error: 'Failed to fetch channels' }, 500);
  }
});

// Create a new channel - SECURED
app.post('/channels/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const body = await c.req.json();
    const { name, description, isPrivate, createdBy } = body;
    
    const channelId = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = {
      id: channelId,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      type: 'channel',
      members: [],
      createdAt: new Date().toISOString(),
      createdBy,
      isPrivate: isPrivate || false
    };
    
    await kv.set(`org:${verifiedOrgId}:channel:${channelId}`, channel);
    
    return c.json({ channel });
  } catch (err) {
    console.error('Error creating channel:', err);
    return c.json({ error: 'Failed to create channel' }, 500);
  }
});

// Get messages for a channel or DM - SECURED
app.get('/messages/:orgId/:channelId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const limit = parseInt(c.req.query('limit') || '100');
    
    const messages = await kv.getByPrefix(`org:${verifiedOrgId}:channel:${channelId}:message:`);
    
    // Sort by timestamp (newest first) and limit
    const sortedMessages = (messages || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .reverse(); // Reverse to show oldest first
    
    return c.json({ messages: sortedMessages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send a message - SECURED
app.post('/messages/:orgId/:channelId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const body = await c.req.json();
    
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      channelId,
      content: body.content,
      userId: body.userId,
      userName: body.userName,
      userAvatar: body.userAvatar,
      timestamp: new Date().toISOString(),
      edited: false,
      reactions: [],
      threadCount: 0,
      parentMessageId: body.parentMessageId || null,
      mentions: body.mentions || [],
      attachments: body.attachments || []
    };
    
    await kv.set(`org:${verifiedOrgId}:channel:${channelId}:message:${messageId}`, message);
    
    // If this is a reply, update parent message thread count
    if (body.parentMessageId) {
      const parentKey = `org:${verifiedOrgId}:channel:${channelId}:message:${body.parentMessageId}`;
      const parentMessages = await kv.get(parentKey);
      if (parentMessages) {
        const parent = parentMessages;
        parent.threadCount = (parent.threadCount || 0) + 1;
        await kv.set(parentKey, parent);
      }
    }
    
    return c.json({ message });
  } catch (err) {
    console.error('Error sending message:', err);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Edit a message - SECURED
app.patch('/messages/:orgId/:channelId/:messageId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const messageId = c.req.param('messageId');
    const body = await c.req.json();
    
    const messageKey = `org:${verifiedOrgId}:channel:${channelId}:message:${messageId}`;
    const existingMessage = await kv.get(messageKey);
    
    if (!existingMessage) {
      return c.json({ error: 'Message not found' }, 404);
    }
    
    const updatedMessage = {
      ...existingMessage,
      content: body.content,
      edited: true,
      editedAt: new Date().toISOString()
    };
    
    await kv.set(messageKey, updatedMessage);
    
    return c.json({ message: updatedMessage });
  } catch (err) {
    console.error('Error editing message:', err);
    return c.json({ error: 'Failed to edit message' }, 500);
  }
});

// Delete a message - SECURED
app.delete('/messages/:orgId/:channelId/:messageId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const messageId = c.req.param('messageId');
    
    await kv.del(`org:${verifiedOrgId}:channel:${channelId}:message:${messageId}`);
    
    return c.json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

// Add reaction to a message - SECURED
app.post('/messages/:orgId/:channelId/:messageId/reactions', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const messageId = c.req.param('messageId');
    const body = await c.req.json();
    
    const messageKey = `org:${verifiedOrgId}:channel:${channelId}:message:${messageId}`;
    const message = await kv.get(messageKey);
    
    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }
    
    const reactions = message.reactions || [];
    const existingReaction = reactions.find((r: any) => r.emoji === body.emoji);
    
    if (existingReaction) {
      // Toggle: if user already reacted, remove their reaction
      if (existingReaction.users.includes(body.userId)) {
        existingReaction.users = existingReaction.users.filter((id: string) => id !== body.userId);
        if (existingReaction.users.length === 0) {
          message.reactions = reactions.filter((r: any) => r.emoji !== body.emoji);
        }
      } else {
        existingReaction.users.push(body.userId);
      }
    } else {
      reactions.push({
        emoji: body.emoji,
        users: [body.userId],
        count: 1
      });
      message.reactions = reactions;
    }
    
    await kv.set(messageKey, message);
    
    return c.json({ message });
  } catch (err) {
    console.error('Error adding reaction:', err);
    return c.json({ error: 'Failed to add reaction' }, 500);
  }
});

// Get thread messages (replies to a message) - SECURED
app.get('/messages/:orgId/:channelId/:messageId/thread', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const channelId = c.req.param('channelId');
    const messageId = c.req.param('messageId');
    
    const allMessages = await kv.getByPrefix(`org:${verifiedOrgId}:channel:${channelId}:message:`);
    const threadMessages = (allMessages || [])
      .filter((msg: any) => msg.parentMessageId === messageId)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return c.json({ messages: threadMessages });
  } catch (err) {
    console.error('Error fetching thread:', err);
    return c.json({ error: 'Failed to fetch thread' }, 500);
  }
});

// Update user presence - SECURED
app.post('/presence/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const body = await c.req.json();
    
    const presence = {
      userId: body.userId,
      status: body.status, // 'online', 'away', 'offline'
      lastSeen: new Date().toISOString(),
      currentChannel: body.currentChannel || null
    };
    
    await kv.set(`org:${verifiedOrgId}:presence:${body.userId}`, presence);
    
    return c.json({ presence });
  } catch (err) {
    console.error('Error updating presence:', err);
    return c.json({ error: 'Failed to update presence' }, 500);
  }
});

// Get all user presences for an org - SECURED
app.get('/presence/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const presences = await kv.getByPrefix(`org:${verifiedOrgId}:presence:`);
    
    return c.json({ presences: presences || [] });
  } catch (err) {
    console.error('Error fetching presences:', err);
    return c.json({ error: 'Failed to fetch presences' }, 500);
  }
});

// Create a direct message conversation - SECURED
app.post('/dm/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const body = await c.req.json();
    const { user1Id, user2Id, user1Name, user2Name } = body;
    
    // Create a consistent DM ID (sorted user IDs)
    const sortedIds = [user1Id, user2Id].sort();
    const dmId = `dm-${sortedIds[0]}-${sortedIds[1]}`;
    
    const dm = {
      id: dmId,
      type: 'dm',
      participants: [
        { id: user1Id, name: user1Name },
        { id: user2Id, name: user2Name }
      ],
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`org:${verifiedOrgId}:channel:${dmId}`, dm);
    
    return c.json({ dm });
  } catch (err) {
    console.error('Error creating DM:', err);
    return c.json({ error: 'Failed to create DM' }, 500);
  }
});

// Search messages - SECURED
app.get('/search/:orgId', async (c) => {
  try {
    const requestedOrgId = c.req.param('orgId');
    
    // Get verified org from JWT
    let authContext;
    try {
      authContext = requireOrg(c);
    } catch (e) {
      return c.json({ error: 'Organization membership required' }, 403);
    }
    
    const { orgId: verifiedOrgId } = authContext;
    
    // Verify user belongs to this org
    if (verifiedOrgId !== requestedOrgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const query = c.req.query('q')?.toLowerCase() || '';
    
    if (!query) {
      return c.json({ messages: [] });
    }
    
    const allMessages = await kv.getByPrefix(`org:${verifiedOrgId}:channel:`);
    const searchResults = (allMessages || [])
      .filter((msg: any) => 
        msg.content && 
        msg.content.toLowerCase().includes(query)
      )
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Limit to 50 results
    
    return c.json({ messages: searchResults });
  } catch (err) {
    console.error('Error searching messages:', err);
    return c.json({ error: 'Failed to search messages' }, 500);
  }
});

export default app;