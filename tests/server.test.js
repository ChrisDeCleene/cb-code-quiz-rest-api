const mongoose = require("mongoose");
const supertest = require("supertest");
const createServer = require("../server");

const TopicModel = require("../models/topic");
const UserModel = require("../models/user");

const { MONGO_URL } = require("../config");

// Middleware for emptying out a collection of documents between tests
async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (let collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    collection.deleteMany();
  }
}

// Middleware for deleting collections after tests run
async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
      // Safe to ignore.
      if (error.message === "ns not found") return;

      // This error happens when you use it.todo.
      // Safe to ignore.
      if (error.message.includes("a background operation is currently running"))
        return;

      console.log(error.message);
    }
  }
}

beforeAll((done) => {
  mongoose.connect(
    MONGO_URL,
    {
      useNewUrlParser: true,
    },
    () => done()
  );
});

afterEach(async () => {
  await removeAllCollections();
});

afterAll(async () => {
  await dropAllCollections();
  await mongoose.connection.close();
});

describe("User Model", () => {
  test("should create a user with email, password, firstName, lastName, createdAt and modifiedAt properties", () => {
    const data = {
      email: 'test@test.com',
      password: '!password',
      firstName: 'Testy',
      lastName: 'Test',
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    const user = new UserModel(data);
    console.log(user)
    expect(user.email).toEqual('email')
    expect(user.password).toEqual('password')
    expect(user.firstName).toEqual('password')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('modifiedAt')
  });
});

describe("Topic Model", () => {
  test("should create a topic with title and questions properties", () => {
    const data = {
      title: "Lorem Ipsum",
      questions: [],
    };
    const topic = new TopicModel(data);
    expect(topic._id).toBeTruthy()
    expect(topic.title).toEqual(data.title);
    expect(topic.questions).toEqual(data.questions);
  });
});
