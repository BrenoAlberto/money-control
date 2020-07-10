const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} = require("apollo-server-express");
require("dotenv").config();

const gravatar = require("../util/gravatar");
const { isEmailValid } = require("../util/validator");

module.exports = {
  newCategory: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        "Você precisa estar logado para realizar esta operação!"
      );
    }

    return await models.Category.create({
      description: args.description,
    });
  },
  updateCategory: async (parent, { id, description }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        "Você precisa estar logado para realizar esta operação!"
      );
    }

    const category = await models.Category.findById(id);
    if (category && String(category.user) !== user.id) {
      throw new ForbiddenError(
        "Você não tem permissão para realizar esta operação!"
      );
    }

    return await models.Category.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          description,
        },
      },
      {
        new: true,
      }
    );
  },
  newExpense: async (
    parent,
    { date, category, value, isNeeded },
    { models, user }
  ) => {
    if (!user) {
      throw new AuthenticationError(
        "Você precisa estar logado para realizar esta operação!"
      );
    }

    return await models.Expense.create({
      date,
      category,
      user: mongoose.Types.ObjectId(user.id),
      value,
      isNeeded,
    });
  },
  updateExpense: async (
    parent,
    { id, date, category, value, isNeeded },
    { models, user }
  ) => {
    if (!user) {
      throw new AuthenticationError(
        "Você precisa estar logado para realizar esta operação!"
      );
    }

    const expense = await models.Expense.findById(id);
    if (expense && String(expense.user) !== user.id) {
      throw new ForbiddenError(
        "Você não tem permissão para realizar esta operação!"
      );
    }

    const $set = {};

    if (date) $set["date"] = date;
    if (category) $set["category"] = category;
    if (value) $set["value"] = value;
    if (isNeeded) $set["isNeeded"] = isNeeded;

    return await models.Expense.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set,
      },
      {
        new: true,
      }
    );
  },
  deleteExpense: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        "Você precisa estar logado para realizar esta operação!"
      );
    }

    const expense = await models.Expense.findById(id);
    if (expense && String(expense.user) !== user.id) {
      throw new ForbiddenError(
        "Você não tem permissão para realizar esta operação!"
      );
    }

    try {
      await expense.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    if (!isEmailValid(email)) throw new UserInputError("Email invalido!");
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
