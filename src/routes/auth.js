import express from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import { userFormatter, failedDefaultResponse, successDefaultResponse, randomHash } from '../helpers/index.js';
import  EmailService from '../services/email/index.js';
import jwt from 'jsonwebtoken';

const router = new express.Router();

router.post('/auth', async (req, res) => {
  const user = new User({
    ...req.body,
  });

  try{
    await user.validate();

    const isEmailExists = await User.findOne({ email: req.body.email });

    if (isEmailExists) throw new Error("This email has already exists");

    //Creating the activation token
    user.activationToken = randomHash(32);

    if (process.env.RESTRICTED_AUTH) {
      await user.save();

      await EmailService.send(process.env.ADMIN_EMAIL, {
        subject: "Activation user",
        html: `The user name ${user.name}. The user email ${user.email}. Activate account <a href='${process.env.BASE_PATH}/auth/activate/${user.activationToken}'>Activate</a>`,
      });

      res.status(200).send({
        message: "You requested access to application. You will get notification when the admit approve it."
      });
      return;
    }

    user.activated = true;

    await user.save();

    const token = await user.generateAuthToken();
    res.status(201).send({
      user: userFormatter(user),
      token
    });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.get('/auth/activate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ activationToken: token });

    if (!user) throw new Error("The user was not found");

    user.activated = true;
    user.activationToken = "";

    await user.save();

    res.send('The access was allowed');
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/auth/change-password', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!req.body.password || !req.body.repeatPassword) {
      throw Error('Property password or repeatPassword is missed');
    }

    if (req.body.password !== req.body.repeatPassword) {
      throw Error("Property passwords aren't matched");
    }

    user.password = req.body.password;

    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token === req.token;
    });

    await user.save();

    res.status(201).send({
      user: userFormatter(user),
      token: req.token
    });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) throw new Error("The user was not found");

    const newPassword = Math.random().toString(36).slice(-8);

    user.password = newPassword;

    await EmailService.send(user.email, {
      subject: "Reset the password",
      html: `The password was changed. The new password is <b>${newPassword}</b>`,
    });

    user.tokens = [];

    await user.save();

    res.status(201).send({
      message: "The password was sent to email",
    });

  } catch(err) {
    res.status(400).send(failedDefaultResponse(err));
  }
})

router.post('/auth/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);

    if (process.env.RESTRICTED_AUTH && !user.activated) {
      res.status(200).send({
        message: "You request is in progress. You will get notification when the admit approve it."
      });
      return;
    }

    const token = await user.generateAuthToken();
    res.send({
      user: userFormatter(user),
      token
    });
  } catch (err) {
    res.status(400).send(failedDefaultResponse(err));
  }
});

router.post('/auth/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(successDefaultResponse());
  } catch (err) {
    res.status(500).send(failedDefaultResponse(err));
  }
});

export default router;