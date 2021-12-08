const hcaptcha = require('hcaptcha');

// validate takes an hCaptcha secret and returns
// an express middleware function
const validate = (secret, sitekey) => (req, res, next) => {
  // get token from the body
  // requires the body parser JSON middleware
  // on the app that uses this middleware
  const token = req.body["g-captcha-response"] ?? req.body["h-captcha-response"];

  // call next with an error if no token present
  if (!token) {
    const err = new Error('bad request - no token provided in body');
    err.status = 400;
    return next(err);
  }

  // verify the hcaptcha and continue on success
  // call next with an error if verification errors or fails
  return hcaptcha.verify(secret, token, sitekey)
    .then((data) => {
      req.hcaptcha = data;
      if (data.success) {
        return next();
      }
      const err = new Error(`bad request - ${data['error-codes']}`);
      err.status = 400;
      return next(err);
    })
    .catch(next);
};

module.exports.middleware = {
  validate,
};
