import { Auth0Provider } from '@bcwdev/auth0provider'
import { carsService } from '../services/CarsService'
import socketService from '../services/SocketService'
import BaseController from '../utils/BaseController'

export class CarsController extends BaseController {
  constructor() {
    super('api/cars')
    this.router
      .get('', this.getAll)
      .get('/:id', this.getById)
      .use(Auth0Provider.getAuthorizedUserInfo)
      .post('', this.create)
      .post('/:id/comments', this.addComment)
      .put('/:id', this.edit)
      .put('/:id/bid', this.bid)
      .delete('/:id', this.delete)
      .delete('/:id/comments/:commentId', this.deleteComment)
  }

  async getAll(req, res, next) {
    try {
      const data = await carsService.find(req.query)
      return res.send(data)
    } catch (error) {
      next(error)
    }
  }

  async getById(req, res, next) {
    try {
      const data = await carsService.findById(req.params.id)
      return res.send(data)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      req.body.creatorId = req.userInfo.id
      const car = await carsService.create(req.body)
      return res.send(car)
    } catch (error) {
      next(error)
    }
  }

  async addComment(req, res, next) {
    try {
      req.body.creatorId = req.userInfo.id
      const car = await carsService.createComment(req.params.id, req.body)
      socketService.messageRoom(car.id, 'NEW_COMMENT', { id: car.id, comments: car.comments, collection: 'cars' })
      return res.send(car)
    } catch (error) {
      next(error)
    }
  }

  async edit(req, res, next) {
    try {
      req.body.creatorId = req.userInfo.id
      req.body.id = req.params.id
      delete req.body.comments
      const data = await carsService.edit(req.body)
      return res.send(data)
    } catch (error) {
      next(error)
    }
  }

  async bid(req, res, next) {
    try {
      const data = await carsService.bid({ id: req.params.id, price: req.body.price })
      // REVIEW[epic=Sockets:Server] OUTGOING Messages to clients
      socketService.messageRoom(data.id, 'BID', { id: data.id, price: data.price, collection: 'cars' })
      socketService.messageUser(data.creatorId, 'NOTIFICATION', { id: data.id, message: 'You have a new bid on one of your listings!', collection: 'cars' })
      return res.send(data)
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const car = await carsService.delete(req.params.id, req.userInfo.id)
      return res.send({ message: 'deleted', data: car })
    } catch (error) {
      next(error)
    }
  }

  async deleteComment(req, res, next) {
    try {
      const car = await carsService.deleteComment(req.params.id, req.params.commentId, req.userInfo.id)
      return res.send({ message: 'comment removed', data: car })
    } catch (error) {
      next(error)
    }
  }
}
