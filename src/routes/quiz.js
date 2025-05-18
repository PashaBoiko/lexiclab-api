import express from 'express';
import auth from '../middleware/auth.js';
import Dictionary from '../models/dictionary.js';
import { failedDefaultResponse } from '../helpers/index.js';
import { limitOfCorrectAnswers } from '../constants/index.js';
import StatisticManager from '../managers/StatisticManager.js';

const router = new express.Router();

router.post('/quiz', auth, async (req, res) => {
  try {
    const data = await Dictionary.findOne({
        userId: req.user._id,
    });

    if (!data) {
      return res.status(400).send(failedDefaultResponse("The item was not found"));
    }

    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      res.send(data);
      return;
    }

    ids.forEach((id) => {
      const index = data.dictionary.findIndex((item) => {
        return item.id === id;
      });
      if (index === -1) return;
      const item = data.dictionary[index];
      if (item.iteration < limitOfCorrectAnswers) item.iteration++;
    });

    await StatisticManager.pushStatistic(req.user._id, {
      quiz_completed: 1
    });

    await data.save();
    res.send(data);
  } catch (err){
    res.status(500).send(failedDefaultResponse(err));
  }
});

export default router;