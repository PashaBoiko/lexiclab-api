import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  activated: {
    type: Boolean,
    default: false,
  },
  activationToken: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
  },
  nativeLanguage: {
    type: String,
    required: true,
    trim: true,
    default: "ua",
  },
  foreignLanguage: {
    type: String,
    required: true,
    trim: true,
    default: "en",
  },
  questionsInQuiz: {
    type: Number,
    required: false,
    trim: true,
    min: 8,
    max: 20,
    default: 8,
  },
  questionsInQuizRepeat: {
    type: Number,
    required: false,
    trim: true,
    min: 8,
    max: 20,
    default: 8,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  avatar: {
    name: {
      type: String,
      required: false,
      max: 255,
    },
    path: {
      type: String,
      required: false,
      max: 255
    }
  }
}, {
  timestamps: true,
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
}

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login, the credentials are incorrect');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Unable to login, the credentials are incorrect');
  }

  return user;
}

userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

const User = mongoose.model('User', userSchema);

export default User;