const axios = require("axios");
const values = require("./values.js");

const siteSecret = values.recaptchaSiteSecret;
const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify?secret=";

const siteVerifyPost = async (userToken, ip) => {
  let response = await axios({
    method: "GET",
    url:
      recaptchaURL + siteSecret + "&response=" + userToken + "&remoteip=" + ip
  });

  return response;
};

module.exports.siteVerify = async function (userToken, ip) {
  return await siteVerifyPost(userToken, ip);
};
