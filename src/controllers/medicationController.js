const mongoose = require("mongoose");
const sendNotification = require("../config/notification");
const Medications = require("../models/Medication");
const Schedules = require("../models/Schedule");

exports.addMedication = async (req, res) => {
  const data = JSON.parse(Object.keys(req.body)[0]);
  console.log(data);
  const { patient, caretaker, details } = data;
  const isMedicationExsist = await Medications.findOne({ caretaker, patient });
  const JsonedData = JSON.parse(details);
  JsonedData.map((eachMedicine) => {
    if (!eachMedicine?._id)
      return (eachMedicine._id = new mongoose.Types.ObjectId());
  });
  if (isMedicationExsist) {
    const updatedMedication = await Medications.findOneAndUpdate(
      { patient, caretaker },
      { $set: { patient, caretaker, details: JsonedData } },
      { new: true }
    )
      .populate(["patient", "caretaker"])
      .exec();
    console.log(updatedMedication, "updatedMedication");
    if (updatedMedication) {
      await sendNotification({
        message: `${updatedMedication?.patient?.name} Medication Changed`,
        external_id: caretaker,
        title: "Congratulations!",
      });
      await sendNotification({
        message: `Medication Updated Successfully`,
        external_id: patient,
        title: "Congratulations!",
      });
      exports.getMedications(
        {
          query: {
            id: caretaker,
            message: "Medication Updated Successfully",
            patient,
          },
        },
        res
      );
    } else {
      res.json({ error: true, message: "User not found" });
    }
  } else {
    const addMedication = await new Medications({
      patient,
      caretaker,
      details: JsonedData,
    });
    addMedication
      .save()
      .then(async (request) => {
        console.log(request, "request");
        const result = await Medications.findOne({ _id: request?._id })
          .populate(["patient", "caretaker"])
          .exec()
          .then(async (newResponse) => {
            await sendNotification({
              message: `${newResponse?.patient?.name} Medication Changed`,
              external_id: caretaker,
              title: "Congratulations!",
            });
            await sendNotification({
              message: `Medication Added Successfully`,
              external_id: patient,
              title: "Congratulations!",
            });
            exports.getMedications(
              {
                query: {
                  id: caretaker,
                  message: "Medication Added Successfully",
                  patient,
                },
              },
              res
            );
          });
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  }
};

exports.getMedications = async (req, res) => {
  const { id, patient, message } = req.query;
  await Medications.findOne({
    caretaker: id,
    patient,
  })
    .populate(["patient", "caretaker"])
    .exec()
    .then((medication) => {
      if (!medication)
        return res.json({ error: true, message: "Medication not found" });
      res.json({
        error: false,
        data: medication,
        message: message ? message : "Request Retrieved Successfully",
      });
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};

exports.getArchivedMedications = async (req, res) => {
  const { patient } = req.query;
  const currentDate = new Date();
  const result = await Medications.findOne({
    patient,
    // till_date: { $lt: currentDate },
  });

  if (result) {
    await Promise.all(
      result?.details?.map(
        async (meds) =>
          await Schedules.findOne({
            medicationID: meds._id,
          })
      )
    )
      .then((values) => {
        // console.log(values, "values"); // [3, 1337, "foo"]
        let AllSchedule = [];
        values?.map((sche) => {
          AllSchedule.push(
            ...sche.schedule.map((test) => {
              // const abc = result?.details?.filter(
              //   (tes) => tes._id == sche.medicationID
              // )[0];
              // console.log(abc, "abc");
              return {
                ...test._doc,
                medication: result?.details?.filter(
                  (tes) => tes._id == sche.medicationID
                )[0],
              };
            })
          );
        });
        // console.log(AllSchedule, "AllSchedule");
        let finalSchedule = [];

        AllSchedule?.map((allSche) => {
          const now = currentDate.getTime();
          const till = new Date(allSche.till).getTime();
          console.log({ till, now, condition: till < now });
          if (till < now) {
            finalSchedule.push(allSche);
          }
        });
        res.json({
          error: false,
          data: finalSchedule,
          message: "Request Retrieved Successfully",
        });
      })
      .catch((err) => {
        res.json({
          error: true,
          data: err.message,
        });
      });
  }

  // .then((medication) => {
  //   if (!medication)
  //     return res.json({ error: true, message: "Medication not found" });
  //   res.json({
  //     error: false,
  //     data: medication,
  //     message: "Request Retrieved Successfully",
  //   });
  // })
  // .catch((err) => res.json({ error: true, message: err.message }));
};
