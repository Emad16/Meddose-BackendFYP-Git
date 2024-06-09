const sendNotification = async ({ message, external_id, title }) => {
  try {
    const axios = require("axios");

    const options = {
      method: "POST",
      url: "https://onesignal.com/api/v1/notifications",
      headers: {
        accept: "application/json",
        Authorization: "Basic ZDI2ODYzMDgtZDMxNS00Y2Y1LTg4YTktZGU4YzAwMzIyODY1",
        "content-type": "application/json",
      },
      data: {
        contents: { en: message },
        headings: { en: title },
        name: "INTERNAL_CAMPAIGN_NAME",
        app_id: "45cc9fb8-ecee-42e6-a109-b6789d4cd2d9",
        include_aliases: {
          external_id: [external_id.toString()],
        },
        target_channel: "push",
        isAndroid: true,
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        console.log(
          { response: response.data, message, external_id, title },
          "notificaion sent"
        );
      })
      .catch(function (error) {
        console.error(error.response.data);
      });
  } catch (error) {
    // res.status(400).send({ error: true, message: error.message });
  }
};

module.exports = sendNotification;
