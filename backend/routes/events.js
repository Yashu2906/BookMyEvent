const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");

//  GET /api/events
router.get("/", eventController.getAllEvents);

//  GET /api/events/:id
router.get("/:id", eventController.getEventById);

//  POST /api/events
router.post("/", auth, eventController.createEvent);

//   DELETE /api/events/:id
router.delete("/:id", auth, eventController.deleteEvent);

module.exports = router;
