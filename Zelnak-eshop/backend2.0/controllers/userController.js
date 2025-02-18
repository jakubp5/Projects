import { Roles } from "../enums/roles.js";
import {
  dbGetAllUsers,
  dbGetUserById,
  dbCreateUser,
  dbUpdateUser,
  dbDeleteUser,
  dbAddUserEvent,
  dbRemoveUserEvent,
  dbGetUserEvents,
  dbFindUserByUsername,
  dbFindUserByEmail,
} from "../models/user.js";
import { dbCheckUserEvent } from "../models/event.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await dbGetAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await dbGetUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  const { username, password, email, role } = req.body;

  const newUser = {
    username,
    password,
    email,
    role: Roles.Registered,
  };

  try {
    await dbCreateUser(newUser);
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const allowedFields = ["username", "email", "role"];
  const updatedUser = {};

  // Filter and include only allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field]) updatedUser[field] = req.body[field];
  });

  // Ensure there's at least one field to update
  if (Object.keys(updatedUser).length === 0) {
    return res
      .status(400)
      .json({ message: "At least one field is required to update." });
  }

  try {
    // Check if the user exists
    const existingUser = await dbGetUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if username is unique (if being updated)
    if (updatedUser.username) {
      const usernameExists = await dbFindUserByUsername(
        updatedUser.username,
        userId
      );
      if (usernameExists) {
        return res.status(400).json({ message: "Username is already taken." });
      }
    }

    // Check if email is unique (if being updated)
    if (updatedUser.email) {
      const emailExists = await dbFindUserByEmail(updatedUser.email, userId);
      if (emailExists) {
        return res.status(400).json({ message: "Email is already taken." });
      }
    }

    const success = await dbUpdateUser(userId, updatedUser);
    if (success) {
      return res
        .status(200)
        .json({ success: true, message: "User updated successfully." });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to update user. Please try again.",
      });
    }
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
      message: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // test existence
    const existingUser = await dbGetUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const result = await dbDeleteUser(userId);

    // check if the user was deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addUserEvent = async (req, res) => {
  const userId = req.params.userId;
  const eventId = req.body.eventId;

  try {
    const exists = await dbCheckUserEvent(userId, eventId);

    if (exists) {
      return res.status(400).json({ message: "User already added to event" });
    }

    const success = await dbAddUserEvent(userId, eventId);
    if (success) {
      res.json({ message: "Event added successfully" });
    } else {
      res.status(500).json({ message: "Failed to add event" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeUserEvent = async (req, res) => {
  const userId = req.params.userId;
  const eventId = req.params.eventId;

  try {
    const success = await dbRemoveUserEvent(userId, eventId);
    if (success) {
      res.json({ message: "Event removed successfully" });
    } else {
      res.status(500).json({ message: "Failed to remove event" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserEvents = async (req, res) => {
  const userId = req.params.userId;

  try {
    const events = await dbGetUserEvents(userId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
