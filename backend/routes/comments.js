const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

// GET all comments for a task (activity log), oldest first
router.get("/task/:taskId", auth, async (req, res, next) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate("author", "name role")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST a new comment on a task
router.post(
  "/task/:taskId",
  auth,
  [body("text").trim().notEmpty().withMessage("Comment text is required")],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ msg: "Task not found" });
      }

      const comment = await Comment.create({
        taskId: req.params.taskId,
        author: req.user.id,
        text: req.body.text,
      });

      // Let the assignee know if someone else commented on their task
      if (task.assignedBy.toString() !== req.user.id) {
        await Notification.create({
          user: task.assignedBy,
          message: `New comment on task "${task.title}"`,
          type: "comment_added",
          taskId: task._id,
        });
      }

      const populated = await Comment.findById(comment._id).populate(
        "author",
        "name role"
      );

      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE a comment (author or admin only)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (comment.isSystem) {
      return res.status(403).json({
        msg: "System activity log entries cannot be deleted",
      });
    }

    const userRole = req.user.role?.toLowerCase();
    const isAuthor = comment.author.toString() === req.user.id;

    if (userRole !== "admin" && !isAuthor) {
      return res.status(403).json({
        msg: "Unauthorized: You can only delete your own comments",
      });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
