import { WebSocketServer } from 'ws';

/**
 * WebSocket Controller
 * Handles real-time communication with connected clients
 */
export class WebSocketController {
  constructor(server, options = {}) {
    this.wss = new WebSocketServer({ 
      server,
      path: options.path || '/ws'
    });
    
    this.clients = new Set();
    this.subscribers = new Map(); // layoutName -> Set of clients
    this.messageHandlers = new Map();
    
    this.setupEventHandlers();
    this.setupDefaultHandlers();
    
    console.log(`✓ WebSocket server initialized on ${options.path || '/ws'}`);
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      ws.clientId = clientId;
      ws.isAlive = true;
      
      console.log(`🔌 Client connected: ${clientId} from ${req.socket.remoteAddress}`);
      
      // Add to clients set
      this.clients.add(ws);
      
      // Send welcome message
      this.send(ws, {
        type: 'connected',
        clientId,
        message: 'Connected to Remote Control API',
        timestamp: new Date().toISOString()
      });

      // Handle ping/pong for keepalive
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        this.clients.delete(ws);
        this.removeSubscriber(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}: ${error.message}`);
        this.clients.delete(ws);
        this.removeSubscriber(clientId);
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });
    });

    // Setup ping/pong interval for keepalive
    this.keepaliveInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return this.wss.close();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(this.keepaliveInterval);
    });
  }

  /**
   * Setup default message handlers
   */
  setupDefaultHandlers() {
    // Subscribe to layout updates
    this.onMessage('subscribe', (ws, data) => {
      const { layoutName } = data;
      if (!layoutName) {
        this.send(ws, { type: 'error', message: 'layoutName is required' });
        return;
      }

      if (!this.subscribers.has(layoutName)) {
        this.subscribers.set(layoutName, new Set());
      }
      this.subscribers.get(layoutName).add(ws);
      
      console.log(`📑 Client ${ws.clientId} subscribed to ${layoutName}`);
      
      this.send(ws, {
        type: 'subscribed',
        layoutName,
        message: `Subscribed to updates for ${layoutName}`
      });
    });

    // Unsubscribe from layout updates
    this.onMessage('unsubscribe', (ws, data) => {
      const { layoutName } = data;
      if (layoutName) {
        this.subscribers.get(layoutName)?.delete(ws);
        console.log(`📑 Client ${ws.clientId} unsubscribed from ${layoutName}`);
      } else {
        this.removeSubscriber(ws.clientId);
        console.log(`📑 Client ${ws.clientId} unsubscribed from all`);
      }
    });

    // Ping/Pong for connection test
    this.onMessage('ping', (ws) => {
      this.send(ws, {
        type: 'pong',
        timestamp: new Date().toISOString()
      });
    });

    // Get connected clients info
    this.onMessage('clients', (ws) => {
      const clientList = Array.from(this.clients).map(c => ({
        clientId: c.clientId,
        subscriptions: this.getClientSubscriptions(c)
      }));
      
      this.send(ws, {
        type: 'clients',
        count: clientList.length,
        clients: clientList
      });
    });
  }

  /**
   * Register custom message handler
   * @param {string} messageType - Type of message to handle
   * @param {Function} handler - Handler function
   */
  onMessage(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Handle incoming WebSocket message
   * @param {WebSocket} ws - WebSocket client
   * @param {string} data - Raw message data
   */
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      const { type } = message;

      console.log(`📨 Message from ${ws.clientId}: ${type}`);

      const handler = this.messageHandlers.get(type);
      if (handler) {
        handler(ws, message);
      } else {
        this.send(ws, {
          type: 'error',
          message: `Unknown message type: ${type}`
        });
      }
    } catch (error) {
      console.error(`❌ Error parsing message: ${error.message}`);
      this.send(ws, {
        type: 'error',
        message: 'Invalid JSON message'
      });
    }
  }

  /**
   * Send message to a specific client
   * @param {WebSocket} ws - WebSocket client
   * @param {Object} data - Message data
   */
  send(ws, data) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all connected clients
   * @param {Object} data - Message data
   * @param {WebSocket} exclude - Client to exclude
   */
  broadcast(data, exclude = null) {
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client !== exclude && client.readyState === 1) {
        client.send(message);
      }
    });
  }

  /**
   * Broadcast to subscribers of a specific layout
   * @param {string} layoutName - Layout name
   * @param {Object} data - Message data
   * @param {WebSocket} exclude - Client to exclude
   */
  broadcastToLayout(layoutName, data, exclude = null) {
    const subscribers = this.subscribers.get(layoutName);
    if (!subscribers) return;

    const message = JSON.stringify(data);
    subscribers.forEach((client) => {
      if (client !== exclude && client.readyState === 1) {
        client.send(message);
      }
    });
  }

  /**
   * Notify about layout update
   * @param {string} layoutName - Layout that was updated
   * @param {Object} data - Update data
   * @param {WebSocket} exclude - Client to exclude
   */
  notifyLayoutUpdate(layoutName, data, exclude = null) {
    console.log(`📢 Notifying update for ${layoutName}`);
    
    this.broadcastToLayout(layoutName, {
      type: 'layout:update',
      layoutName,
      timestamp: new Date().toISOString(),
      ...data
    }, exclude);

    // Also broadcast to all if no specific subscribers
    if (!this.subscribers.has(layoutName) || this.subscribers.get(layoutName).size === 0) {
      this.broadcast({
        type: 'layout:update',
        layoutName,
        timestamp: new Date().toISOString(),
        ...data
      }, exclude);
    }
  }

  /**
   * Notify about build status
   * @param {Object} data - Build status data
   */
  notifyBuildStatus(data) {
    this.broadcast({
      type: 'build:status',
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Remove subscriber from all subscriptions
   * @param {string} clientId - Client ID to remove
   */
  removeSubscriber(clientId) {
    for (const [layoutName, clients] of this.subscribers.entries()) {
      clients.forEach((client) => {
        if (client.clientId === clientId) {
          clients.delete(client);
        }
      });
    }
  }

  /**
   * Get subscriptions for a client
   * @param {WebSocket} client - WebSocket client
   * @returns {string[]} - Array of layout names
   */
  getClientSubscriptions(client) {
    const subscriptions = [];
    for (const [layoutName, clients] of this.subscribers.entries()) {
      if (clients.has(client)) {
        subscriptions.push(layoutName);
      }
    }
    return subscriptions;
  }

  /**
   * Generate unique client ID
   * @returns {string} - Client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   * @returns {Object} - Stats
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      totalSubscriptions: Array.from(this.subscribers.values())
        .reduce((sum, set) => sum + set.size, 0),
      layouts: Array.from(this.subscribers.keys())
    };
  }

  /**
   * Close all connections and cleanup
   */
  close() {
    clearInterval(this.keepaliveInterval);
    
    this.wss.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

    this.wss.close();
    console.log('✓ WebSocket server closed');
  }
}

export default WebSocketController;
