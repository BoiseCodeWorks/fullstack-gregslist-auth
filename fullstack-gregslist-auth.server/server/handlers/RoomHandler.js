import { SocketHandler } from '../utils/SocketHandler'

// REVIEW[epic=Sockets:Server]
export class RoomHandler extends SocketHandler {
  /**
   * @param {import("socket.io").Server} io
   * @param {import("socket.io").Socket} socket
   * @param {{ id: string; email: string; }} user
   * @param {{ id: string; email: string; }} profile
   */
  constructor(io, socket, user, profile) {
    super(io, socket, user, profile)
    this
      .on('JOIN_ROOM', this.join)
      .on('LEAVE_ROOM', this.leave)
  }

  async join(payload) {
    this.socket.join(payload.roomId)
    this.socket.emit('JOINED', {
      user: this.user,
      profile: this.profile,
      payload
    })
  }

  async leave(payload) {
    this.socket.leave(payload.roomId)
    this.socket.emit('LEFT', { roomId: payload.roomId })
  }
}
