const mongoose = require("mongoose");
const supertest = require("supertest");
const createServer = require("../server");

const QuestionModel = require("../models/question");
const UserModel = require("../models/user");
const ScoreModel = require("../models/score");

const { MONGO_TEST_URL } = require("../config");
const {
  createUser,
  createQuestion,
  createScore,
  seedQuestionsCollection,
  seedUsersCollection,
} = require("./seed");

// Middleware for emptying out a collection of documents between tests
const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (let collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    return collection.deleteMany();
  }
};

// Middleware for deleting collections after tests run
const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.collections[collectionName];
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

// Drop entire testing collection before disconnecting from MongoDB
afterAll(async () => {
  await dropAllCollections();
  await mongoose.connection.close();
});

describe("User Model", () => {
  test("should create a user with email, password, firstName, lastName, userType, createdAt and modifiedAt properties", async () => {
    const { user, userObject } = await createUser();
    console.log("User Model Test", user);
    expect(user.email).toEqual(userObject.email);
    expect(user.password).toEqual(userObject.password);
    expect(user.firstName).toEqual(userObject.firstName);
    expect(user.userType).toEqual(userObject.userType);
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("modifiedAt");
  });
});

describe("Question Model", () => {
  test("should create a question with question, answers, topics, and type", async () => {
    const { question, questionObject } = await createQuestion();
    console.log("Question Model Test", question);
    expect(question._id).toBeTruthy();
    expect(question.question).toEqual(questionObject.question);
    expect(question.answers).toEqual(questionObject.answers);
    expect(question.topics).toEqual(questionObject.topics);
    expect(question.type).toEqual(questionObject.type);
  });
});

describe("Score Model", () => {
  test("should create a score using a user and question document", async () => {
    const { user } = await createUser("chris@test.com");

    const { question } = await createQuestion();

    const { score, scoreObject } = await createScore(user._id, question._id);

    expect(score._id).toBeTruthy();
    expect(score.userId).toEqual(user._id);
    expect(score.questionId).toEqual(question._id);
    expect(score.isCorrect).toEqual(scoreObject.isCorrect);
  });
});

describe("GET /api/questions", () => {
  // Create three questions (SAVE THEM?)
  beforeAll(async () => {
    await dropAllCollections();
    await seedQuestionsCollection();
  });
  test("should return an array of all questions", async () => {
    const app = await createServer();
    const questions = await QuestionModel.find({});
    await supertest(app)
      .get("/questions")
      .expect(200)
      .then((response) => {
        console.log("RESPONSE", response.body);
        expect(response.body.length).toEqual(3);
        console.log(questions);
        expect(response.body[0]._id).toEqual(questions[0].id);
        expect(response.body[1]._id).toEqual(questions[1].id);
        expect(response.body[2]._id).toEqual(questions[2].id);
      });
  });
  test("should return a status code of 200", async () => {
    const app = await createServer();
    await supertest(app).get("/questions").expect(200);
  });
});

describe("GET /api/questions/:id", () => {
  beforeAll(async () => {
    await dropAllCollections();
    await seedQuestionsCollection();
  });
  test("should return the question object for the given ID", async () => {
    const { question } = await createQuestion(
      "What is the average weight of an elephant?"
    );
    console.log(question.id);

    const app = await createServer();

    await supertest(app)
      .get("/questions/" + question.id)
      .then((response) => {
        expect(response.body._id).toBe(question.id);
        expect(response.body.question).toBe(question.question);
        expect(response.body.answers[0]).toBe(question.answers[0]);
        expect(response.body.topics[0]).toBe(question.topics[0]);
        expect(response.body.type).toBe(question.type);
      });
  });
  test("should return a 200 status code for valid IDs", async () => {
    const { question } = await createQuestion(
      "What is the average weight of an elephant?"
    );
    console.log(question.id);

    const app = await createServer();

    await supertest(app)
      .get("/questions/" + question.id)
      .expect(200);
  });
  test("should return a 404 status code for invalid IDs", async () => {
    const questionId = "61fd574bf78fad302968ee70";

    const app = await createServer();

    await supertest(app)
      .get("/questions/" + questionId)
      .expect(404);
  });
});
