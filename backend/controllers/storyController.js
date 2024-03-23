const Story = require('../models/storyModel');
const mongoose = require('mongoose');

// Middleware for logging requests
const logRequest = (req, res, next) => {
  console.log(req.path, req.method);
  next();
};

// Middleware for global error handling
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Validation middleware example (you can replace this with a library like Joi)
const validateCreateStory = (req, res, next) => {
  const { title, tags, content } = req.body;

  if (!title || !tags || !content) {
    return res.status(400).json({ error: 'Title, tags, and content are required' });
  }

  next();
};

// Get all stories
const getStories = async (req, res) => {
  console.log(req?.user);
  //Getting childID
  let child_id = req?.user?.child;
  let filter = {};


  if (req?.user?.role == "Parent") {
    filter["children"] = "";
    //Checking if the id of child is present and if present then creates expression filter
    if (child_id) {
      filter["children"] = new RegExp(child_id);
    }
  }


  //Getting stories from mongo
  const stories = await Story.find(filter).sort({ createdAt: -1 });
  res.status(200).json(stories);
};
// Get a single story
const getStory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No story found' });
  }

  const story = await Story.findById(id);

  if (!story) {
    return res.status(404).json({ error: 'No story found' });
  }

  res.status(200).json(story);
};

// Create a new story
const createStory = async (req, res) => {
  const { title, children, tags, content, author, state } = req.body;

  try {
    const story = await Story.create({ title, children, tags, content, author, state });
    res.status(200).json(story);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a story
const deleteStory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No story found' });
  }

  const story = await Story.findOneAndDelete({ _id: id });

  if (!story) {
    return res.status(404).json({ error: 'No story found' });
  }

  res.status(200).json(story);
};

// Update a story
const updateStory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No story found' });
  }

  try {
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { ...req.body }, // Update story with new values from req.body
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ error: 'No story found' });
    }

    res.status(200).json(updatedStory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update the state of a story
const updateStoryState = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No story found' });
  }

  try {
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { state: 'approved' }, // Update state to 'approved'
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ error: 'No story found' });
    }

    res.status(200).json(updatedStory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  logRequest,
  errorHandler,
  validateCreateStory,
  getStories,
  getStory,
  createStory,
  deleteStory,
  updateStory,
  updateStoryState,
};
