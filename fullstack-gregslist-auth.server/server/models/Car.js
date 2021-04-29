import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Comment = new Schema({
  body: { type: String, required: true },
  creatorId: { type: String, required: true }
}, { timestamps: true, toJSON: { virtuals: true } })

Comment.virtual('creator', {
  localField: 'creatorId',
  ref: 'Account',
  foreignField: '_id',
  justOne: true
})

const Car = new Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    imgUrl: { type: String, required: true, default: '//placehold.it/300x300' },
    description: { type: String, minLength: 3 },
    creatorId: { type: String, ref: 'Account', required: true },
    comments: [Comment]
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

Car.virtual('creator', {
  localField: 'creatorId',
  ref: 'Account',
  foreignField: '_id',
  justOne: true
})

// REVIEW[epic=Subdocs] Populating on a find
Car.post('find', async function(docs) {
  for (const doc of docs) {
    await doc.populate('comments.creator', 'name picture').execPopulate()
  }
})

// // inside Board.js
// Board.post('findOneAndDelete', async function(doc) {
//   await dbContext.Lists.deleteMany({ boardId: doc.id })
// })

// // inside List.js
// Lists.post('deleteMany', async function(docs) {
//   // itterate over docs and call delete many tasks
// })

export default Car
