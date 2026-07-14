const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const auth = require("../middleware/auth");

// ===============================
// GET /api/analytics/summary
// Every logged-in user sees stats across ALL tasks (Admin and Member alike).
// ===============================
router.get("/summary", auth, async (req, res, next) => {
  try {
    const statusCounts = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = {
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Overdue: 0,
    };
    statusCounts.forEach((s) => {
      counts[s._id] = s.count;
    });

    const now = new Date();
    const overdueNotMarked = await Task.countDocuments({
      dueDate: { $lt: now },
      status: { $ne: "Completed" },
    });

    const workload = await Task.aggregate([
      {
        $group: {
          _id: "$assignedBy",
          totalTasks: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          totalTasks: 1,
          completed: 1,
        },
      },
    ]);

    res.json({
      statusCounts: counts,
      overdueNotMarked,
      workload,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
