const config = require('../config');

async function sendSmsOtp(phoneNumber, otpCode) {
  // Clean to exactly 10-digit Indian phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  
  // 1. Fast2SMS (Indian Mobile Carriers)
  const fast2smsKey = process.env.FAST2SMS_API_KEY || config.fast2smsApiKey;

  if (fast2smsKey) {
    try {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=otp&variables_values=${otpCode}&numbers=${cleanPhone}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        }
      });

      const data = await res.json();
      if (data.return) {
        console.log(`📱 [FAST2SMS SUCCESS] Live Carrier SMS OTP ${otpCode} delivered to +91 ${cleanPhone}. Request ID: ${data.request_id || 'OK'}`);
        return { sent: true, provider: 'Fast2SMS' };
      } else {
        console.warn(`📱 [FAST2SMS RESP ERROR] ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('Fast2SMS fetch error:', err.message);
    }
  }

  // 2. Twilio (Global Mobile Carriers)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedPhone = `+91${cleanPhone}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: formattedPhone,
        From: twilioFrom,
        Body: `Your CareerForge Verification Code is: ${otpCode}. Valid for 5 minutes.`
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`📱 [TWILIO SUCCESS] Real SMS OTP delivered to ${formattedPhone}`);
        return { sent: true, provider: 'Twilio' };
      } else {
        console.warn(`📱 [TWILIO ERROR] ${data.message}`);
      }
    } catch (err) {
      console.error('Twilio SMS error:', err.message);
    }
  }

  console.warn(`⚠️ [SMS GATEWAY WARNING] Could not dispatch carrier SMS to +91 ${cleanPhone}. Check API key balance or Fast2SMS dashboard.`);
  return { sent: false, reason: 'SMS delivery failed' };
}

module.exports = {
  sendSmsOtp
};
