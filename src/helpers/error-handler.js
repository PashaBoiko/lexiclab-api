function failedDefaultResponse(err) {
  let errorMessage = ""
  if (typeof err === "object") errorMessage = err.toString();
  else errorMessage = err;
  return {
    status: "failed",
    message: errorMessage,
  }
}

function successDefaultResponse() {
  return {
    status: "success",
  }
}
