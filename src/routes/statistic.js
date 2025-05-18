import express from 'express';
import auth from '../middleware/auth.js';
import StatisticManager from '../managers/StatisticManager.js';
import { failedDefaultResponse } from '../helpers/index.js';

const router = new express.Router();

router.get('/statistic', auth, async (req, res) => {
  try {
    const statistic = await StatisticManager.find(req.user._id);
    res.send(statistic);
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/statistic', auth, async (req, res) => {
  try {
    const validatePayload = (payload) => {
      payload.forEach((value) => {
        if (!(value === 0 || value === 1))
          throw Error("Invalid payload, the value should be 0 or 1");
      })
    }

    const {
      word = 0,
      quiz_completed = 0,
      repeat_completed = 0,
    } = req.body;

    validatePayload([word, quiz_completed, repeat_completed]);

    const data = await StatisticManager.pushStatistic(req.user._id, {
      word,
      quiz_completed,
      repeat_completed,
    });
    res.send(data);
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

export default router;