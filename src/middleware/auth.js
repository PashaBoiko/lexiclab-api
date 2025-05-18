import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { failedDefaultResponse } from '../helpers/index.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').trim().replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_AUTH_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next()
  } catch (e) {
    res.status(401).send(failedDefaultResponse('Please authenticate'));
  }
}

export default auth;