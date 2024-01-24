const Class = require("../models/classModel"); 
const mongoose = require('mongoose');

// Get all classes
const getClasses = async (req, res) => {
  const classes = await Class.find({}).sort({ createdAt: -1 });
  const classesWithId = classes.map((c) => ({
    ...c.toJSON(),
    id: c._id.toString(),
  }));
  res.status(200).json(classesWithId);
};

// Get a single class
const getClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const singleClass = await Class.findById(id);

  if (!singleClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json({ ...singleClass.toJSON(), id: singleClass._id.toString() });
};

// Create a new class
const createClass = async (req, res) => {
  const { className, subject } = req.body;

  try {
    const newClass = await Class.create({ className, subject });
    res.status(201).json({ ...newClass.toJSON(), id: newClass._id.toString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const deletedClass = await Class.findOneAndDelete({ _id: id });

  if (!deletedClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json(deletedClass);
};

// Update a class
const updateClass = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }

  const updatedClass = await Class.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true } // Return the updated document
  );

  if (!updatedClass) {
    return res.status(404).json({ error: "No class found" });
  }

  res.status(200).json({ ...updatedClass.toJSON(), id: updatedClass._id.toString() });
};

// Add a student to a class
const addStudent = async (req, res) => {
  const { id } = req.params;
  const student = req.body;

  // Check if an image was uploaded and is available in req.file
  if (req.file) {
    // Convert the image file buffer to a MongoDB Buffer
    student.image = Buffer.from(req.file.buffer);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No class found" });
  }
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $push: { students: student } },
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ error: "No class found" });
    }
    res.status(200).json(updatedClass);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const transferStudent = async (req, res) => {
  const { studentId, oldClassId, newClassId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(oldClassId) || !mongoose.Types.ObjectId.isValid(newClassId)) {
    return res.status(404).json({ error: "Class not found" });
  }

  try {
    // Remove student from old class
    await Class.findByIdAndUpdate(oldClassId, { $pull: { students: { _id: studentId } } });

    // Add student to new class
    const student = await Class.findById(oldClassId).select({ students: { $elemMatch: { _id: studentId } } });
    await Class.findByIdAndUpdate(newClassId, { $push: { students: student } });

    res.status(200).json({ message: "Student transferred successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  deleteClass,
  updateClass,
  addStudent,
  transferStudent,
};
