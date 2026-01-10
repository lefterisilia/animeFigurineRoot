import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testreactnative72@gmail.com',
        pass: 'tjcqyxjwinrkqlzv',
    },
});


function generateRandomPin(length) {
  let pin = '';
  for (let i = 0; i < length; i++) {
    // For the first digit, ensure it's not 0 (1-9)
    if (i === 0) {
      pin += Math.floor(Math.random() * 9) + 1;
    } else {
      // For other positions, use digits 0-9
      pin += Math.floor(Math.random() * 10);
    }
  }
  return pin;
}

async function sendPinEmail(email, pin) {
  const mailOptions = {
      from: 'testreactnative72@gmail.com',
      to: email,
      subject: 'AnimeFigurine - Verify your email address',
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Verify your email address </h2>
          <p style="font-size: 18px; color: #555;">Use the following OTP to procced to a new password:</p>
          <p style="font-size: 24px; font-weight: bold; color: #007BFF;">${pin}</p>
      </div>
    `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('PIN email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending PIN email:', error);
  }
}
export { sendPinEmail, generateRandomPin };
