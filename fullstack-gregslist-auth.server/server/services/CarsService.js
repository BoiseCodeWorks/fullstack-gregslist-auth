import { dbContext } from '../db/DbContext'
import { BadRequest, Forbidden } from '../utils/Errors'

class CarsService {
  async bid(bid) {
    if (!bid.price) {
      throw new BadRequest('You must provide a price')
    }
    const car = await this.findById(bid.id)
    car.price = bid.price
    await car.save()
    return car
  }

  async find(query = {}) {
    const cars = await dbContext.Cars.find(query)
      .populate('creator', 'name picture')

    return cars
  }

  async findById(id) {
    const car = await dbContext.Cars.findById(id)
      .populate('creator', 'name picture')
      .populate('comments.creator', 'name picture')
    if (!car) {
      throw new BadRequest('Invalid Id')
    }
    return car
  }

  async create(body) {
    const car = await dbContext.Cars.create(body)
    return car
  }

  async createComment(carId, body) {
    // const car = await this.findById(id)
    // car.comments.push(body)
    // await car.save()
    // return car
    const updated = await dbContext.Cars.findOneAndUpdate({ _id: carId }, { $push: { comments: body } }, { new: true })
    if (!updated) {
      throw new BadRequest('invalid id')
    }
    return await this.findById(carId)
  }

  async edit(body) {
    const found = await this.findById(body.id)
    if (found.creatorId !== body.creatorId) {
      throw new Forbidden('You Cannot modify another users Car')
    }
    const car = await dbContext.Cars.findOneAndUpdate({ _id: body.id, creatorId: body.creatorid }, body, { new: true })
    return car
  }

  async delete(carId, userId) {
    const car = await this.findById(carId)
    if (car.creatorId !== userId) {
      throw new Forbidden('You Cannot delete another users Car')
    }
    await dbContext.Cars.findOneAndDelete({ _id: carId, creatorId: userId })
    return 'Successfully Deleted'
  }

  async deleteComment(id, commentId, creatorId) {
    const car = await this.findById(id)
    const comment = car.comments.id(commentId)
    if (car.creatorId === creatorId || comment.creatorId === creatorId) {
      comment.remove()
      await car.save()
      return car
    }
    throw new BadRequest('You cannot delete the comment you do not own on a car you do not own')
    // const updated = await dbContext.Cars.findOneAndUpdate({ _id: id }, { $pull: { comments: { _id: commentId, creatorId } } }, { new: true })
    // if (!updated) {
    //   throw new BadRequest('invalid id')
    // }
    // return updated
  }
}

export const carsService = new CarsService()
