import crypto from 'crypto';

function userFormatter(user){
  return {
    name: user.name,
    email: user.email,
    nativeLanguage: user.nativeLanguage,
    foreignLanguage: user.foreignLanguage,
    questionsInQuiz: user.questionsInQuiz,
    questionsInQuizRepeat: user.questionsInQuizRepeat,
    avatar: user.avatar,
    createdAt: user.createdAt
  }
}

function failedDefaultResponse(err) {
  return {
    status: "failed",
    message: err.toString(),
  }
}

function successDefaultResponse() {
  return {
    status: "success",
  }
}

function randomHash(size = 16) {
  return crypto.randomBytes(size).toString('hex');
}

function validationErrorsHandler(err) {
  const { errors } = err;
  const result = {
    status: "failed",
    message: "Validation error",
    fields: {},
  };

  const matchFieldKey = (key) => {
    if (key) return key.split(".").slice(-1);
    return null;
  }

  Object.keys(errors).forEach((matchedKey) => {
    const key = matchFieldKey(matchedKey);

    if (key) {
      Object.assign(result.fields, {
        [key]: errors[matchedKey].message
      })
    }
  });

  return result;
}

export {
  userFormatter,
  failedDefaultResponse,
  successDefaultResponse,
  validationErrorsHandler,
  randomHash
};