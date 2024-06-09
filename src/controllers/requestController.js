const sendNotification = require("../config/notification");
const Requests = require("../models/Request");
const User = require("../models/User");

exports.caretakerRequest = async (req, res) => {
  // const data = req.body;
  const data = JSON.parse(Object.keys(req.body)[0]);
  console.log(data, "data");
  const { patient, caretaker, status, requestBy } = data;
  const isRequestExsist = await Requests.findOne({ patient });
  if (isRequestExsist)
    return res.json({ error: true, message: "request already sent" });
  const caretakerRequest = await new Requests({
    patient,
    caretaker,
    status,
    requestBy,
  });
  caretakerRequest
    .save()
    .then(async (request) => {
      await sendNotification({
        message: "New Request Arrived",
        external_id: requestBy == "patient" ? caretaker : patient,
        title: `${
          requestBy == "Patient" ? "Caretaker" : "patient"
        } has sent you a request`,
      });
      return res.json({ error: false, message: "request sent successfully" });
      // exports.getCaretakerRequest({ query: { id: caretaker } }, res);
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};

exports.getCaretakerRequest = async (req, res) => {
  const { id } = req.query;
  await Requests.find({
    caretaker: id,
  })
    .sort({ createdAt: -1 })
    .populate(["patient", "caretaker"])
    .exec()
    .then((request) => {
      if (!request)
        return res.json({ error: true, message: "Request not found" });
      res.json({ error: false, data: request });
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};

exports.getPatientRequest = async (req, res) => {
  const { id } = req.query;
  await Requests.find({
    patient: id,
    status: "pending",
  })
    .populate(["patient", "caretaker"])
    .exec()
    .then((request) => {
      if (!request)
        return res.json({ error: true, message: "Request not found" });
      res.json({ error: false, data: request });
    })
    .catch((err) => res.json({ error: true, message: err.message }));
};

exports.updateCaretakerRequest = async (req, res) => {
  // const data = req.body;
  const data = JSON.parse(Object.keys(req.body)[0]);
  const { caretaker, status, patient } = data;
  try {
    await Requests.findOneAndUpdate(
      {
        caretaker,
        patient,
      },
      { $set: { status } },
      { new: true }
    )
      .populate(["patient", "caretaker"])
      .exec()
      .then(async (request) => {
        if (!request)
          return res.json({ error: true, message: "Request not found" });

        if (request.status == "accept") {
          await User.findOneAndUpdate(
            { _id: patient },
            { $set: { careTaker: caretaker } },
            { new: true }
          );
          await User.findOneAndUpdate(
            { _id: caretaker, pateintList: { $ne: patient } },
            { $push: { pateintList: patient } },
            { new: true }
          );
          await User.findOne({ _id: patient }).then((response) => {
            res.json({ error: false, data: response });
          });
          await sendNotification({
            message: `Request has been accepted`,
            external_id: caretaker,
            title: "Congratulations!",
          });
          await sendNotification({
            message: `Request has been accepted`,
            external_id: patient,
            title: "Congratulations!",
          });
        } else {
          await sendNotification({
            message: `Request has been rejected`,
            external_id: caretaker,
            title: "Opps!",
          });
          await sendNotification({
            message: `Request has been rejected`,
            external_id: patient,
            title: "Opps!",
          });
          res.json({ error: false, message: "Request Rejected", request });
        }
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
};
