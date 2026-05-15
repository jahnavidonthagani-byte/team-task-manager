const express = require("express");

const router = express.Router();

const Task = require("../models/Task");

const auth =
  require("../middleware/auth");

const role =
  require("../middleware/role");


// GET TASKS
router.get(
  "/",
  auth,
  async (req, res) => {

    try {

      const tasks =
        await Task.find()
          .populate("projectId", "name")
          .populate("assignedTo", "name");

      res.json(tasks);

    } catch (err) {

      res.status(500).json({
        msg: "Error loading tasks"
      });
    }
  }
);


// CREATE TASK
router.post(
  "/",
  auth,
  role("Admin"),
  async (req, res) => {

    try {

      const task =
        await Task.create(req.body);

      res.json(task);

    } catch (err) {

      res.status(500).json({
        msg: "Error creating task"
      });
    }
  }
);

module.exports = router;