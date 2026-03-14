import { User } from '../models/index.js';

export const getUserById = async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.userId}`);
    const user = await User.findOne({
      where: { userId: req.params.userId }
    });

    if (!user) {
      console.warn("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log(`Updating user with ID: ${req.params.userId}`);
    const user = await User.findOne({
      where: { userId: req.params.userId }
    });

    if (!user) {
      console.warn("User not found for update");
      return res.status(404).json({ error: "User not found" });
    }

    await user.update(req.body);
    console.log("User updated:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    console.log(`Deleting user with ID: ${req.params.userId}`);
    const user = await User.findOne({
      where: { userId: req.params.userId }
    });

    if (!user) {
      console.warn("User not found for deletion");
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    console.log("User deleted:", user);
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    console.log(`Fetching progress for user ID: ${req.params.userId}`);
    const user = await User.findOne({
      where: { userId: req.params.userId }
    });

    if (!user) {
      console.warn("User progress not found");
      return res.status(404).json({ error: "User progress not found" });
    }

    console.log("User progress:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const setUserAge = async (req, res) => {
  try {
    const { age } = req.body;
    console.log(`Setting age for user: ${req.params.userId}, Age: ${age}`);

    if (!age || age < 5 || age > 19) {
      return res.status(400).json({ error: "Invalid age. Must be between 5 and 19" });
    }

    const userType = age >= 13 ? 'teenager' : 'child';
    const user = await User.findOne({
      where: { userId: req.params.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({ age, userType });
    console.log("User age set:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error setting user age:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
