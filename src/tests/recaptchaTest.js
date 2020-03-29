const recaptcha = require("../main/lambda/recaptcha.js");
const userToken =
  "03AOLTBLSGCiJCZJsbjC1gpss3I22utqqeveUfnY9HG1fhXh8WIAFV3gEiIiPD617LXmmLp_RdWLSvSfedlpAbe5rn_muAenZjow5GrrmeJuEJDPXv_ukr1WVeOArV3puA2Q9BON2gsk3FtSq9qOuTqLaqE49uq_KStpSXY-Iy3cTE3nGdDN8W6_kQw3DU8SRELerdz1yEIYCSy0VpBlpqERK1ygmadcJ-5zRM4VPcBkEBsOsQJCxQKlVi23yvtGsNxijd-M4Y2gffMYrQZwlReT364zai6cR-PM1qTxJ5Onx_rV9OFWFhOZ2AiYjT8Pp-5X1qCuOf3ZtK";

const main = async () => {
  const result = await recaptcha.siteVerify(userToken, "127.0.0.1");
  console.log(result["data"]);
  const resultBool = result["data"]["success"];
  console.log(resultBool);
  if (resultBool == false) {
    console.log("bad recaptcha");
  }
  process.exit();
};

main();
