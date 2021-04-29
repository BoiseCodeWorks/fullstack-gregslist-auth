import { AppState } from '../AppState'
import { SocketHandler } from '../utils/SocketHandler'

// REVEIW[epic=Sockets:Client]
class SocketService extends SocketHandler {
  constructor() {
    super()
    this.on('BID', this.bid)
    this.on('NEW_COMMENT', this.newComment)
  }

  authenticate(bearerToken) {
    this.socket.emit('authenticate', bearerToken)
  }

  // {id, price, collection}
  bid(payload) {
    if (payload.collection === 'cars') {
      AppState.activeCar.price = payload.price
    }
  }

  // { id, comments, collection }
  newComment(payload) {
    AppState.activeCar.comments = payload.comments
  }
}

export const socketService = new SocketService()
