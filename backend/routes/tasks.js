const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Task = require("../models/Task");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

// ===============================
// GET TASKS
// Everyone who is logged in sees every task (Admin and Member alike).
// Only creating/deleting tasks is restricted - see below.
// ===============================
router.get("/", auth, async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate("projectId", "name")
      .populate("assignedBy", "name role");

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// ===============================
// CREATE TASK (ADMIN ONLY)
// ===============================
router.post(
  "/",
  auth,
  role("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("projectId").notEmpty().withMessage("projectId is required"),
    body("assignedBy").notEmpty().withMessage("assignedBy is required"),
  ],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const { title, description, projectId, assignedBy, dueDate } = req.body;

      const task = await Task.create({
        title,
        description: description || "",
        projectId,
        assignedBy,
        dueDate,
        status: "Pending",
      });

      const creator = await User.findById(req.user.id, "name");
      const assignee = await User.findById(assignedBy, "name");
      await Comment.create({
        taskId: task._id,
        author: req.user.id,
        text: `${creator?.name || "Someone"} created this task and assigned it to ${assignee?.name || "someone"}`,
        isSystem: true,
      });

      // Notify the assignee that a new task has landed on their plate
      await Notification.create({
        user: assignedBy,
        message: `You were assigned a new task: "${title}"`,
        type: "task_assigned",
        taskId: task._id,
      });

      const newTask = await Task.findById(task._id)
        .populate("projectId", "name")
        .populate("assignedBy", "name role");

      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  }
);

// ===============================
// UPDATE TASK STATUS
// Any logged-in user (Admin or Member) can update any task's status.
// Only creating/deleting tasks is restricted to Admins.
// ===============================
router.put(
  "/:id",
  auth,
  [
    body("status")
      .isIn(["Pending", "In Progress", "Completed", "Overdue"])
      .withMessage("Invalid status value"),
  ],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const { status } = req.body;

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ msg: "Task not found" });
      }

      const previousStatus = task.status;
      task.status = status;
      await task.save();

      // Auto-log this status change as a system activity entry, so it
      // shows up in the same Activity Log panel as regular comments
      if (previousStatus !== status) {
        const actor = await User.findById(req.user.id, "name");
        await Comment.create({
          taskId: task._id,
          author: req.user.id,
          text: `${actor?.name || "Someone"} changed status from "${previousStatus}" to "${status}"`,
          isSystem: true,
        });
      }

      // If someone other than the assignee changed the status, let them know
      if (task.assignedBy.toString() !== req.user.id) {
        await Notification.create({
          user: task.assignedBy,
          message: `Task "${task.title}" status changed to ${status}`,
          type: "task_status_changed",
          taskId: task._id,
        });
      }

      const updatedTask = await Task.findById(task._id)
        .populate("projectId", "name")
        .populate("assignedBy", "name role");

      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  }
);

// ===============================
// DELETE TASK (ADMIN ONLY)
// ===============================
router.delete("/:id", auth, role("admin"), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
