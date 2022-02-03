const mongoose = require("mongoose");
const supertest = require("supertest");
const createServer = require("../server");

const QuestionModel = require("../models/question");
const UserModel = require("../models/user");
const ScoreModel = require("../models/score");

const { MONGO_TEST_URL } = require("../config");

// Adjust if tests are timing out frequently
// jest.setTimeout(30000);

// Middleware for emptying out a collection of documents between tests
const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (let collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    collection.deleteMany();
  }
};

// Middleware for deleting collections after tests run
const dropAllCollections = async () => {
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
};

// Function for creating and accessing a user
const createUser = () => {
  const userObject = {
    email: "test@test.com",
    password: "!password",
    firstName: "Testy",
    lastName: "Test",
    userType: "Student",
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
  const user = new UserModel(userObject);
  return {
    user,
    userObject,
  };
};

// Function for creating and accessing a question
const createQuestion = () => {
  const questionObject = {
    question: "Do you know the muffin man?",
    answers: [
      ["Who lives in Drury Lane?", 1],
      ["Nope", 0],
    ],
    topics: ["General"],
    type: "multiple-choice",
  };
  const question = new QuestionModel(questionObject);
  return {
    question,
    questionObject,
  };
};

const createScore = (userId, questionId) => {
  const scoreObject = {
    userId,
    questionId,
    isCorrect: false,
  };

  const score = new ScoreModel(scoreObject);

  return {
    score,
    scoreObject,
  };
};

// Set up mongodb connection before starting tests
beforeAll((done) => {
  mongoose.connect(
    MONGO_TEST_URL,
    {
      useNewUrlParser: true,
    },
    () => done()
  );
});

// deleteMany on each collection before moving to next test
afterEach(async () => {
  await removeAllCollections();
});

// Drop entire testing collection before disconnecting from MongoDB
afterAll(async () => {
  await dropAllCollections();
  await mongoose.connection.close();
});

describe("User Model", () => {
  test("should create a user with email, password, firstName, lastName, userType, createdAt and modifiedAt properties", () => {
    const { user, userObject } = createUser();
    expect(user.email).toEqual(userObject.email);
    expect(user.password).toEqual(userObject.password);
    expect(user.firstName).toEqual(userObject.firstName);
    expect(user.userType).toEqual(userObject.userType);
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("modifiedAt");
  });
});

describe("Question Model", () => {
  test("should create a question with question, answers, topics, and type", () => {
    const { question, questionObject } = createQuestion();
    expect(question._id).toBeTruthy();
    expect(question.question).toEqual(questionObject.question);
    expect(question.answers).toEqual(questionObject.answers);
    expect(question.topics).toEqual(questionObject.topics);
    expect(question.type).toEqual(questionObject.type);
  });
});

describe("Score Model", () => {
  test("should create a score using a user and question document", () => {
    const { user } = createUser();
    // user.save();
    const { question } = createQuestion();
    // question.save();
    const { score, scoreObject } = createScore(user._id, question._id);

    expect(score._id).toBeTruthy();
    expect(score.userId).toEqual(user._id);
    expect(score.questionId).toEqual(question._id);
    expect(score.isCorrect).toEqual(scoreObject.isCorrect);
  });
});
