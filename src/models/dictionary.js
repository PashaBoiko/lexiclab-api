import mongoose from 'mongoose';

const dictionarySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  dictionary: [
    {
      en: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255,
      },
      ua: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255,
      },
      description: {
        type: String,
        required: false,
        trim: true,
        maxLength: 500,
      },
      iteration: {
        type: Number,
        default: 0
      }
    }
  ]
});

const Dictionary = mongoose.model('Dictionary', dictionarySchema);

export default Dictionary;

