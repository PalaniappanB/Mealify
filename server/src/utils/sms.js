const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'MEALFY';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID; // only needed if MSG91 requires a DLT-approved template

// Sends an OTP SMS via MSG91. Falls back to a console-logged mock when no
// MSG91_AUTH_KEY is configured, so local dev never needs a real SMS account.
async function sendOtpSms(phone, code) {
  if (!MSG91_AUTH_KEY) {
    console.log(`[mock SMS] ${phone} -> your Mealify OTP is ${code}`);
    return { mocked: true };
  }

  const mobile = phone.startsWith('91') ? phone : `91${phone}`;
  const params = new URLSearchParams({
    mobile,
    authkey: MSG91_AUTH_KEY,
    otp: code,
    sender: MSG91_SENDER_ID
  });
  if (MSG91_TEMPLATE_ID) params.set('template_id', MSG91_TEMPLATE_ID);

  const response = await fetch(`https://control.msg91.com/api/v5/otp?${params.toString()}`, { method: 'POST' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.type === 'error') {
    throw new Error(data.message || `MSG91 request failed with status ${response.status}`);
  }
  return data;
}

module.exports = { sendOtpSms, isMocked: !MSG91_AUTH_KEY };
