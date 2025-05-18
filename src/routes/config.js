import express from 'express';
import {
  languages,
  limitOfCorrectAnswers,
  quizAmountOfQuestions ,
  questionTypes
} from '../constants/index.js';
import { failedDefaultResponse } from '../helpers/index.js';

const router = new express.Router();

router.get('/config/public', (req, res) => {
  try{
    res.status(200).send({
      languages,
      limitOfCorrectAnswers,
      quizAmountOfQuestions,
      questionTypes
    })
  } catch (err) {
    res.status(500).send(failedDefaultResponse(err));
  }
});

export default router;