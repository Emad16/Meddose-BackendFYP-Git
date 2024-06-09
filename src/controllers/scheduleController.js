const mongoose = require("mongoose");
const Schedules = require("../models/Schedule");
var cron = require("node-cron");
const sendNotification = require("../config/notification");
var moment = require("moment");

exports.addSchedule = async (req, res) => {
  const data = JSON.parse(Object.keys(req.body)[0]);
  try {
    const { medicationID, schedule, user } = data;
    const isScheduleExsist = await Schedules.findOne({ medicationID });
    const JsonedData = JSON.parse(schedule);
    console.log(JsonedData);
    console.log(isScheduleExsist, "isScheduleExsist");
    // return res.json({ success: true });
    if (isScheduleExsist) {
      const updatedSchedule = await Schedules.findOneAndUpdate(
        { medicationID },
        { $set: { medicationID, schedule: JsonedData } },
        { new: true }
      );

      if (updatedSchedule) {
        const enterItem = JsonedData[JsonedData.length - 1];
        console.log(enterItem, "JsonedData", JSON.parse(user), "user");
        const hour = moment(enterItem.time).format("H");
        const minute = moment(enterItem.time).format("mm");
        console.log(
          "scheduled on => ",
          `${minute} ${hour} * * ${enterItem.day}`
        );
        cron.schedule(`${minute} ${hour} * * ${enterItem.day}`, async () => {
          console.log("hitted done");
          await sendNotification(JSON.parse(user));
        });
        exports.getSchedule(
          {
            query: {
              medicationID,
              message: "Schedule Updated Successfully",
            },
          },
          res
        );
      } else {
        res.json({ error: true, message: "Schedule not found" });
      }
    } else {
      const addMedication = await new Schedules({
        medicationID,
        schedule: JsonedData,
      });
      addMedication
        .save()
        .then((request) => {
          const enterItem = JsonedData[JsonedData.length - 1];
          console.log(enterItem, "JsonedData", JSON.parse(user), "user");
          const hour = moment(enterItem.time).format("H");
          const minute = moment(enterItem.time).format("mm");
          console.log(
            "scheduled on => ",
            `${minute} ${hour} * * ${enterItem.day}`
          );
          cron.schedule(`${minute} ${hour} * * ${enterItem.day}`, async () => {
            console.log("hitted done");
            await sendNotification(JSON.parse(user));
          });
          exports.getSchedule(
            {
              query: {
                medicationID,
                message: "Schedule Added Successfully",
              },
            },
            res
          );
        })
        .catch((err) => res.json({ error: true, message: err.message }));
    }
    // return res.json({
    //   schedule: JSON.parse(schedule),
    //   medicationID,
    // });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  const { medicationID, message } = req.query;
  await Schedules.findOne({
    medicationID,
  })
    .populate(["patient", "caretaker", "medicationID"])
    .exec()
    .then((schedule) => {
      if (!schedule)
        return res.json({ error: true, message: "Schedule not found" });
      res.json({
        error: false,
        data: schedule,
        message: message ? message : "Schedule Retrieved Successfully",
      });
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};
