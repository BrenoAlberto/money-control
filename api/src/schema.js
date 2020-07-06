const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar DateTime

  type Category {
    id: ID!
    description: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Expense {
    id: ID!
    date: DateTime!
    category: Category!
    value: Float!
    isNeeded: Boolean!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    expenses: [Expense!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    expenses: [Expense!]!
    expense(id: ID): Expense!
    categories: [Category!]!
    category(id: ID): Category!
    user(username: String!): User
    users: [User!]!
    me: User!
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
  }
`;
