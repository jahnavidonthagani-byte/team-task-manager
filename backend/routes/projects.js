const express = require("express");

const router = express.Router();

const Project = require("../models/Project");

const auth =
  require("../middleware/auth");

const role =
  require("../middleware/role");


// GET ALL PROJECTS
router.get(
  "/",
  auth,
  async (req, res) => {

    try {

      const projects =
        await Project.find();

      res.json(projects);

    } catch (err) {

      res.status(500).json({
        msg: "Error loading projects"
      });
    }
  }
);


// CREATE PROJECT
router.post(
  "/",
  auth,
  role("Admin"),
  async (req, res) => {

    try {

      const project =
        await Project.create({
          name: req.body.name
        });

      res.json(project);

    } catch (err) {

      res.status(500).json({
        msg: "Error creating project"
      });
    }
  }
);

module.exports = router;