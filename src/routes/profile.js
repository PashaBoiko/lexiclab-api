import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { failedDefaultResponse, userFormatter, validationErrorsHandler, randomHash } from '../helpers/index.js';
import S3UploadService from '../services/s3-upload/index.js';

const router = new express.Router();
const upload = multer();

router.post('/profile', auth, async (req, res) => {
  try {
    const user = req.user;

    if (req.body.questionsInQuiz) {
      user.questionsInQuiz = req.body.questionsInQuiz;
    }

    if (req.body.questionsInQuizRepeat) {
      user.questionsInQuizRepeat = req.body.questionsInQuizRepeat
    }

    await user.save();

    res.send({
      ...userFormatter(user)
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(403).send(validationErrorsHandler(err))
      return;
    }
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) throw Error('The file is messed');
    if (!process.env.S3_STATIC_BUCKET_NAME) throw Error("The bucket name is missed");

    const user = req.user;

    if (user.avatar.length) throw Error("The user avatar has already added");

    function generateFileName(fileNameBase, userName) {
      const type = fileNameBase.split('.').at(-1);
      return `${userName}-${randomHash(16)}.${type}`;
    }

    const params = {
      Bucket: process.env.S3_STATIC_BUCKET_NAME,
      Key: `profile/${generateFileName(file.originalname, user.name)}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const data = await S3UploadService.upload(params);

    user.avatar.name = data.Key;
    user.avatar.path = `${process.env.S3_CDN_PATH}${data.Key}`;

    await user.save();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({
      ...userFormatter(user)
    });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.delete('/profile/avatar', auth, async (req, res) => {
  try {
    const user = req.user;

    const params = {
      Bucket: process.env.S3_STATIC_BUCKET_NAME,
    }

    if (!user.avatar?.name) throw Error("The avatar field is empty");

    Object.assign(params, { Key: user.avatar.name });

    user.avatar = {};

    await user.save();
    await S3UploadService.delete(params);

    res.status(200).send({
      ...userFormatter(user)
    });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
})

export default router;