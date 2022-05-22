export const formatNumber = (num) => {
  // var parts = num.toString().split(".");
  // parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // return parts[0];
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatUserPhoneNumber = (phoneNumberString) => {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return match[1] + " " + match[2] + " " + match[3];
  }
  return null;
};
