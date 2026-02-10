import { Leaderboard } from '../models/Leaderboard.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';


export const submitScore = async (req, res) => {
  try {
    const { userId, story, score, topic, level } = req.body;

    console.log("Received Score Submission:", req.body); 

    if (!userId || !story || !score || !topic || !level) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (![userId, story, topic, level].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await Leaderboard.findOneAndUpdate(
      { userId, story },
      {
        userId: new mongoose.Types.ObjectId(userId),
        story: new mongoose.Types.ObjectId(story),
        score,
        topic: new mongoose.Types.ObjectId(topic),
        level: new mongoose.Types.ObjectId(level),
        timestamp: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Updated/Inserted Score:", updated); 

    const verifyEntry = await Leaderboard.findById(updated._id);
    console.log("Stored Leaderboard Entry:", verifyEntry); 

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error submitting score:", err);
    res.status(500).json({ error: err.message });
  }
};
export const getLeaderboardByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    console.log("Fetching leaderboard for story:", storyId);

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      console.log("Invalid story ID format:", storyId);
      return res.status(400).json({ error: "Invalid story ID" });
    }

    const rawLeaderboard = await Leaderboard.find({ story: new mongoose.Types.ObjectId(storyId) });
    console.log("Raw Leaderboard (Before Population):", rawLeaderboard);

    if (!rawLeaderboard.length) {
      console.log("No leaderboard entries found for this story.");
      return res.status(404).json({ error: "No leaderboard data found" });
    }

    const leaderboard = await Leaderboard.find({ story: storyId })
      .populate("userId", "username imageUrl")
      .populate("topic", "name")
      .populate("level", "levelNumber")
      .sort({ score: -1 });

    console.log("Leaderboard after population:", JSON.stringify(leaderboard, null, 2));

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: err.message });
  }
};



export const getFilteredLeaderboard = async (req, res) => {
  try {
    const { topic, level, story } = req.query;
    const filter = {};

    if (topic && mongoose.Types.ObjectId.isValid(topic)) filter.topic = topic;
    if (level && mongoose.Types.ObjectId.isValid(level)) filter.level = level;
    if (story && mongoose.Types.ObjectId.isValid(story)) filter.story = story;

    const results = await Leaderboard.find(filter)
      .populate("userId", "username") 
      .populate("topic", "name") 
      .populate("level", "levelNumber") 
      .sort({ score: -1, timestamp: 1 })
      .limit(50);

    res.json(results);
  } catch (err) {
    console.error("Error fetching filtered leaderboard:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getOverallLeaderboard = async (req, res) => {
  try {
    const results = await Leaderboard.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          latestEntry: { $last: '$$ROOT' }, 
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'topics',
          localField: 'latestEntry.topic',
          foreignField: '_id',
          as: 'topic',
        },
      },
      {
        $lookup: {
          from: 'levels',
          localField: 'latestEntry.level',
          foreignField: '_id',
          as: 'level',
        },
      },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$level', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          totalScore: 1,
          topic: { $ifNull: ['$topic.name', 'Unknown Topic'] }, 
          level: { $ifNull: ['$level.levelNumber', 'Unknown Level'] }, 
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 50 },
    ]);

    console.log("FINAL API Response:", JSON.stringify(results, null, 2)); 

    res.json(results);
  } catch (err) {
    console.error("Error fetching overall leaderboard:", err);
    res.status(500).json({ error: err.message });
  }
};
