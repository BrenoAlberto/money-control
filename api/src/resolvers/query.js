module.exports = {
  expenses: async (parent, args, { models }) => {
    return await models.Expense.find();
  },
  expense: async (parent, args, { models }) => {
    return await models.Expense.findById(args.id);
  },
  categories: async (parent, args, { models }) => {
    return await models.Category.find();
  },
  category: async (parent, args, { models }) => {
    return await models.Categories.findById(args.id);
  },
};
