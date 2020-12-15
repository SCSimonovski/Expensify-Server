const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const Item = require("./expenses-model");

const HttpError = require("../error/http-error");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,

      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,

      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Your password can't contain the word PASSWORD");
        }
      },
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  userObject.id = userObject._id;

  delete userObject._id;
  delete userObject.tokens;
  delete userObject.password;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  user.tokens = user.tokens.filter(({ token }) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return token;
    } catch (e) {
      return false;
    }
  });

  try {
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    user.tokens = user.tokens.concat({ token });

    return token;
  } catch (e) {
    throw new Error();
  }
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

userSchema.statics.findOneOrCreate = async ({ email, name }) => {
  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email });
      await user.save();
    }

    const token = await user.generateAuthToken();

    return { user, token };
  } catch (e) {
    return new Error();
  }
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete users items when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Item.deleteMany({ owner: user._id });

  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
