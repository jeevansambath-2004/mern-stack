const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Create transporter using Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
      }
    });
  }

  async sendTodoIncompleteNotification(userEmail, todoTitle, userName) {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: '↩️ Todo Marked Incomplete - Task Status Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">📝 Task Reopened</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">A task has been marked as incomplete</p>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px;">Task Reopened</h2>
                <p style="color: #374151; font-size: 16px; margin: 0; font-weight: 500;">"${todoTitle}"</p>
              </div>
              
              <div style="margin: 30px 0;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${userName || 'there'},<br><br>
                  This task has been marked as incomplete and is back on your todo list. 
                  No worries - sometimes we need to revisit tasks. You've got this! 💪
                </p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">💡 Reminder</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                  Don't let this discourage you! Every step forward counts, even if we sometimes need to take a step back to reassess.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  This notification was sent from your MERN Todo App<br>
                  <span style="font-size: 12px;">Updated on ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
Task Reopened: "${todoTitle}"

Hi ${userName || 'there'},

This task has been marked as incomplete and is back on your todo list. No worries - sometimes we need to revisit tasks. You've got this!

Updated on ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

This notification was sent from your MERN Todo App.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Todo incomplete email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending todo incomplete email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTodoCompletionNotification(userEmail, todoTitle, userName) {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: '✅ Todo Completed - Task Achievement Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">You've completed a task</p>
              </div>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h2 style="color: #15803d; margin: 0 0 10px 0; font-size: 20px;">Task Completed</h2>
                <p style="color: #374151; font-size: 16px; margin: 0; font-weight: 500;">"${todoTitle}"</p>
              </div>
              
              <div style="margin: 30px 0;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${userName || 'there'},<br><br>
                  Great job on completing your task! Every completed task brings you one step closer to achieving your goals. 
                  Keep up the excellent work and maintain this momentum.
                </p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">💡 Pro Tip</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                  Celebrating small wins helps maintain motivation and builds positive habits. Take a moment to acknowledge your progress!
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  This notification was sent from your MERN Todo App<br>
                  <span style="font-size: 12px;">Completed on ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
Congratulations! You've completed a task.

Task Completed: "${todoTitle}"

Hi ${userName || 'there'},

Great job on completing your task! Every completed task brings you one step closer to achieving your goals. Keep up the excellent work and maintain this momentum.

Completed on ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

This notification was sent from your MERN Todo App.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Todo completion email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending todo completion email:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
