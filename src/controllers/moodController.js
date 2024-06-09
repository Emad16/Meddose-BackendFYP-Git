const mongoose = require("mongoose");
const MoodList = require("../models/MoodList");
const Mood = require("../models/Mood");
const sendNotification = require("../config/notification");

exports.addMoodList = async (req, res) => {
  const data = req.body;
  // const data = JSON.parse(Object.keys(req.body)[0]);
  try {
    await MoodList.insertMany(data)
      .then(function (data) {
        console.log("Data inserted"); // Success
        res.json({ error: false, message: "Data Inserted Succesfully", data });
      })
      .catch(function (error) {
        console.log(error); // Failure
        res.json({ error: true, message: err.message });
      });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.getMoodList = async (req, res) => {
  await MoodList.find()
    .then((moods) => {
      res.json({
        error: false,
        moods,
        message: "Moods Retrieved Successfully",
      });
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};

exports.addPatientMood = async (req, res) => {
  // const data = req.body;
  const data = JSON.parse(Object.keys(req.body)[0]);
  try {
    const { user, mood } = data;
    const addMood = await new Mood(data);
    console.log("object", data);
    await addMood
      .save()
      .then(async (mood) => {
        await Mood.findOne({ _id: mood?._id })
          .sort({ createdAt: -1 })
          .populate(["user", "mood"])
          .exec()
          .then(async (mood) => {
            await sendNotification({
              message: `${mood?.user?.name} is feeling ${mood?.mood?.mood}`,
              external_id: mood?.user?.careTaker,
              title: mood?.notes,
            });
            await sendNotification({
              message: `Mood Added Successfully`,
              external_id: user,
              title: mood?.notes,
            });
            res.json({
              message: "Mood added successfully",
              error: false,
              mood,
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ error: true, message: err.message });
      });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.getPatientMood = async (req, res) => {
  try {
    await Mood.find({ user: req.query.id })
      .sort({ createdAt: -1 })
      .populate(["user", "mood"])
      .exec()
      .then((moods) => {
        res.json({
          error: false,
          moods,
          message: "Moods Retrieved Successfully",
        });
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  } catch (error) {
    return res.json({ error: error.message });
  }
};
