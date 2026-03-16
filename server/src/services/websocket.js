const { Server } = require('socket.io')

let io = null
const userSockets = new Map()

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join', (userId) => {
      userSockets.set(userId, socket.id)
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined with socket ${socket.id}`)
    })

    socket.on('leave', (userId) => {
      userSockets.delete(userId)
      socket.leave(`user:${userId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId)
          break
        }
      }
    })
  })

  return io
}

function getIO() {
  return io
}

function notifyUser(userId, event, data) {
  if (!io) {
    console.log('[Mock] Notification:', userId, event, data)
    return
  }

  io.to(`user:${userId}`).emit(event, data)
  console.log(`Notification sent to user ${userId}:`, event)
}

function notifyAll(event, data) {
  if (!io) {
    console.log('[Mock] Broadcast:', event, data)
    return
  }

  io.emit(event, data)
}

function notifyAdmins(event, data) {
  if (!io) {
    console.log('[Mock] Admin notification:', event, data)
    return
  }

  io.to('admins').emit(event, data)
}

const NotificationTypes = {
  ORDER_CREATED: 'order:created',
  ORDER_PAID: 'order:paid',
  ORDER_ASSIGNED: 'order:assigned',
  ORDER_STARTED: 'order:started',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',
  NEW_MESSAGE: 'message:new',
  SYSTEM_NOTICE: 'system:notice'
}

module.exports = {
  initWebSocket,
  getIO,
  notifyUser,
  notifyAll,
  notifyAdmins,
  NotificationTypes
}
