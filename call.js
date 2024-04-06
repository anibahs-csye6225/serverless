const { sendEmail } = require('./sendEmail'); // Import your Cloud Function

const req = {
  "data": {
    "account": {
      "username": "anibahs@gmail.com", // Modify test data as needed
      // Add other account properties as required for testing
    }
  }
}

const res = {
  status: function (code) {
    return {
      end: function () {
        console.log('Response Status:', code);
      },
    };
  },
};

console.log("Calling SendEmail");
sendEmail(req, res); // Invoke your Cloud Function with test data
