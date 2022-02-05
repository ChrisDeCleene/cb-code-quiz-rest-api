const express = require("express");
const QuestionModel = require("../models/question");
const router = express.Router();

module.exports = (app) => {
  app.use("/questions", router);

  /**
   * @swagger
   * definitions:
   *  Question:
   *    properties:
   *      question:
   *        type: string
   *      answers:
   *        type: array
   *        properties:
   *          answer:
   *            type: string
   *          isCorrect:
   *            type: boolean
   *      topics:
   *        type: array
   *        properties:
   *          topic:
   *            type: string
   */

  /**
   * @swagger
   * /questions:
   *  get:
   *    tags:
   *      - Questions
   *    description: Returns all questions
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: An array of questions
   *        schema:
   *          $ref: "#/definitions/Question"
   */
  router.get("/", async (req, res, next) => {
    const questions = await QuestionModel.find();
    res.send({ questions });
  });

  /**
   * @swagger
   * /questions/{id}:
   *  get:
   *    tags:
   *      - Questions
   *    description: Returns a single question
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Question's id
   *        in: path
   *        required: true
   *        type: string
   *    responses:
   *      200:
   *        description: A single question
   *        schema:
   *          $ref: "#/definitions/Question"
   */
  router.get("/:id", async (req, res, next) => {
    const question = await QuestionModel.findById(req.params.id);
    if (!question) {
      return res.sendStatus(404);
    } else {
      return res.send({ question });
    }
  });

  /**
   * @swagger
   * /questions/:
   *  post:
   *    tags:
   *      - Questions
   *    description: Creates a new question
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: question
   *        description: Question object
   *        in: body
   *        required: true
   *        schema:
   *          $ref: '#/definitions/Question'
   *    responses:
   *      201:
   *        description: Successfully created
   *        schema:
   *          $ref: "#/definitions/Question"
   */
  router.post("/", async (req, res, next) => {
    try {
      const questionResponse = new QuestionModel(req.body.question);
      const newQuestion = await questionResponse.save();
      res.status(201).send({ question: newQuestion });
    } catch (err) {
      res.status(400).send(err);
    }
  });
};
