import mongoose from 'mongoose';

const statisticSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  statistics: [
    {
      word: {
        type: Number,
        required: true,
        default: 0,
      },
      quiz_completed: {
        type: Number,
        required: true,
        default: 0,
      },
      repeat_completed: {
        type: Number,
        required: true,
        default: 0
      },
      date: {
        type: Date,
        required: true,
        default: new Date(),
      }
    }
  ]
});

const Statistic = mongoose.model('Statistic', statisticSchema);

export default Statistic;