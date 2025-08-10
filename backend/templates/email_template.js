function getTaskReminderEmail({ title, description, deadlineDisplay }) {
  return `
    <html>
      <body style="background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #4f8cff 0%, #2355d8 100%); padding: 24px 32px; color: #fff;">
            <h2 style="margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: 1px;">Task Tick</h2>
            <p style="margin: 8px 0 0 0; font-size: 1.1rem;">Your Task Reminder</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 1.1rem; color: #222; margin-bottom: 18px;">Dear User,</p>
            <p style="color: #444; margin-bottom: 24px;">This is a friendly reminder for your upcoming task. Please see the details below:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 12px; background: #f4f8ff; color: #2355d8; font-weight: 600; border-radius: 6px 0 0 6px; border: 1px solid #e3e8f0;">Title</td>
                <td style="padding: 10px 12px; border-radius: 0 6px 6px 0; border: 1px solid #e3e8f0;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f4f8ff; color: #2355d8; font-weight: 600; border-radius: 6px 0 0 6px; border: 1px solid #e3e8f0;">Description</td>
                <td style="padding: 10px 12px; border-radius: 0 6px 6px 0; border: 1px solid #e3e8f0;">${description}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f4f8ff; color: #2355d8; font-weight: 600; border-radius: 6px 0 0 6px; border: 1px solid #e3e8f0;">Deadline</td>
                <td style="padding: 10px 12px; border-radius: 0 6px 6px 0; border: 1px solid #e3e8f0;">${deadlineDisplay}</td>
              </tr>
            </table>
            <div style="margin-bottom: 24px;">
              <p style="color: #2355d8; font-weight: 500; margin: 0;">Stay productive and never miss a deadline with Task Tick!</p>
            </div>
            <p style="font-size: 0.97rem; color: #888; margin-bottom: 0;">You received this email because you enabled notifications in Task Tick.</p>
            <div style="margin-top: 32px; text-align: center;">
              <span style="font-size: 0.95rem; color: #b0b8c9;">&copy; ${new Date().getFullYear()} Task Tick. All rights reserved.</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = { getTaskReminderEmail };
