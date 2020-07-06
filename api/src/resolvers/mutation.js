const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
require("dotenv").config();

const gravatar = require("../util/gravatar");
const { isEmailValid } = require("../util/validator");

module.exports = {
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    if (!isEmailValid(email)) throw "err";
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Erro ao criar conta");
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) throw new AuthenticationError("Erro ao logar");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AuthenticationError("Erro ao logar");

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
};
