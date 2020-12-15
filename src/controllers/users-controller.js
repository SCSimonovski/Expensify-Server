const { OAuth2Client } = require("google-auth-library");

const User = require("../models/user-model.js");
const HttpError = require("../error/http-error");

const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//////////////////////////////////////////////////////////
// Create new user ///////////////////////////////////////

const createUser = async (req, res, next) => {
  const user = new User({ ...req.body });

  try {
    const token = await user.generateAuthToken();

    await user.save();
    // sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (err) {
    next(new HttpError("Unable to create an account", 422));
  }
};

//////////////////////////////////////////////////////////
// Login User ////////////////////////////////////////////

const loginUser = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    await user.save();

    res.send({ user, token });
  } catch (err) {
    next(new HttpError("Unable to login", 422));
  }
};

//////////////////////////////////////////////////////////
// Login with Google ////////////////////////////////////

const googleLogin = async (req, res, next) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    next(new HttpError("Unable to login with Google", 422));
  }

  try {
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email } = response.payload;

    if (!email_verified) {
      throw new Error();
    }

    const { user, token } = await User.findOneOrCreate({ name, email });

    if (!user || !token) {
      throw new Error();
    }

    await user.save();

    res.send({ user, token });
  } catch (e) {
    next(new HttpError("Unable to login with Google", 422));
  }
};

//////////////////////////////////////////////////////////
// Logout User ///////////////////////////////////////////

const logoutUser = async (req, res, next) => {
  const { id, token } = req.body;

  try {
    const user = await User.findOne({
      _id: id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    user.tokens = user.tokens.filter((doc) => doc.token !== token);

    await user.save();
  } catch (err) {
    console.log(err);
  }

  res.status(205).send();
};

//////////////////////////////////////////////////////////
// Logout user from all sessions ////////////////////////

const logoutAll = async (req, res, next) => {
  let user = req.user;

  try {
    user.tokens = [];
    await user.save();

    res.status(205).send();
  } catch (err) {
    next(err);
  }
};

//////////////////////////////////////////////////////////
// Get user's profile ///////////////////////////////////////

const getUser = async (req, res, next) => {
  res.send(req.user);
};

//////////////////////////////////////////////////////////
// Update User ///////////////////////////////////////////

const updateUser = async (req, res, next) => {
  const user = req.user;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    throw HttpError("Invalid updates!", 400);
  }

  try {
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (err) {
    next(err);
  }
};

//////////////////////////////////////////////////////////
// Delete user ///////////////////////////////////////

const deleteUser = async (req, res, next) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);

    res.send();
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////////////////////

module.exports = {
  createUser,
  loginUser,
  googleLogin,
  logoutUser,
  logoutAll,
  getUser,
  updateUser,
  deleteUser,
};
