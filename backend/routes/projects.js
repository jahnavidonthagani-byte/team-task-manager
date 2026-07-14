const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Project = require("../models/Project");
const auth = require("../middleware/auth");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

function isAdmin(req) {
  return req.user.role?.toLowerCase() === "admin";
}

// ==========================================
// GET ALL PROJECTS
// ==========================================
router.get("/", auth, async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name role")
      .populate("members", "name role");

    // Guard against a missing/deleted owner breaking the frontend
    const safeProjects = projects.map((project) => {
      const p = project.toObject();
      if (!p.owner) {
        p.owner = { name: "Unknown", role: "unknown" };
      }
      return p;
    });

    res.json(safeProjects);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET SINGLE PROJECT
// ==========================================
router.get("/:id", auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name role")
      .populate("members", "name role");

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// CREATE PROJECT (Admin Only)
// ==========================================
router.post(
  "/",
  auth,
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ msg: "Access Denied: Admins only" });
      }

      const { name, description } = req.body;

      const project = await Project.create({
        name,
        description,
        owner: req.user.id,
        members: [],
      });

      const newProject = await Project.findById(project._id).populate(
        "owner",
        "name role"
      );
      res.status(201).json(newProject);
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// UPDATE PROJECT (Admin or owner)
// ==========================================
router.put(
  "/:id",
  auth,
  [body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty")],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      const isOwner = project.owner.toString() === req.user.id;
      if (!isAdmin(req) && !isOwner) {
        return res.status(403).json({ msg: "Access Denied: Not your project" });
      }

      const { name, description } = req.body;
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;

      await project.save();

      const updated = await Project.findById(project._id)
        .populate("owner", "name role")
        .populate("members", "name role");

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// ADD MEMBER TO PROJECT (Admin or owner)
// ==========================================
router.post(
  "/:id/members",
  auth,
  [body("userId").notEmpty().withMessage("userId is required")],
  async (req, res, next) => {
    if (handleValidation(req, res)) return;

    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      const isOwner = project.owner.toString() === req.user.id;
      if (!isAdmin(req) && !isOwner) {
        return res.status(403).json({ msg: "Access Denied: Not your project" });
      }

      const { userId } = req.body;
      if (!project.members.map((m) => m.toString()).includes(userId)) {
        project.members.push(userId);
        await project.save();
      }

      const updated = await Project.findById(project._id)
        .populate("owner", "name role")
        .populate("members", "name role");

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// REMOVE MEMBER FROM PROJECT (Admin or owner)
// ==========================================
router.delete("/:id/members/:userId", auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user.id;
    if (!isAdmin(req) && !isOwner) {
      return res.status(403).json({ msg: "Access Denied: Not your project" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    const updated = await Project.findById(project._id)
      .populate("owner", "name role")
      .populate("members", "name role");

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DELETE PROJECT (Admin or owner only)
// ==========================================
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user.id;
    if (!isAdmin(req) && !isOwner) {
      return res.status(403).json({ msg: "Access Denied: Not your project" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
