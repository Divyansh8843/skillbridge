const nodemailer = require('nodemailer');
const path = require('path');

// Create transporter function to ensure environment variables are loaded
const createTransporter = () => {
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app-specific password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  };
  
  return nodemailer.createTransport(emailConfig);
};

// Email templates
const emailTemplates = {
  requestSent: (data) => ({
    subject: '🎯 New Help Request Created - SkillBridge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🎯 Help Request Created Successfully!</h2>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Hello <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Your help request has been successfully created and is now visible to potential helpers in the SkillBridge community.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Request Details:</h3>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">We'll notify you when someone accepts your request or sends you a message.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/my-requests" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Requests</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The SkillBridge Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `
  }),

  requestAccepted: (data) => ({
    subject: '✅ Your Help Request Has Been Accepted! - SkillBridge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #059669; text-align: center; margin-bottom: 20px;">✅ Help Request Accepted!</h2>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Hello <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Great news! Your help request has been accepted by <strong>${data.helperName}</strong>.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #1f2937; margin-top: 0;">🤝 Helper Details:</h3>
            <p><strong>Name:</strong> ${data.helperName}</p>
            <p><strong>Email:</strong> ${data.helperEmail}</p>
            <p><strong>Accepted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Request Details:</h3>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Description:</strong> ${data.description}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">You can now start communicating with your helper through the chat feature.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/accept-request/${data.requestId}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Open Chat</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The SkillBridge Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `
  }),

  requestCompleted: (data) => ({
    subject: '🎉 Help Request Completed! - SkillBridge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">🎉 Help Request Completed!</h2>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Hello <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Congratulations! Your help request has been marked as completed by <strong>${data.helperName}</strong>.</p>
          
          <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="color: #1f2937; margin-top: 0;">✅ Completion Details:</h3>
            <p><strong>Helper:</strong> ${data.helperName}</p>
            <p><strong>Completed:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Rating:</strong> ${data.rating ? `${data.rating}/5 stars` : 'Not rated yet'}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📋 Request Details:</h3>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Description:</strong> ${data.description}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Don't forget to rate your helper's assistance to help build our community!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/my-requests" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Requests</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The SkillBridge Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `
  }),

  newMessage: (data) => ({
    subject: '💬 New Message Received - SkillBridge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">💬 New Message Received</h2>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Hello <strong>${data.recipientName}</strong>,</p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">You have received a new message from <strong>${data.senderName}</strong> regarding your help request.</p>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin-top: 0;">📨 Message Preview:</h3>
            <p style="font-style: italic; color: #6b7280;">"${data.messagePreview}"</p>
            <p><strong>From:</strong> ${data.senderName}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/accept-request/${data.requestId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Message</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The SkillBridge Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  // Send email with error handling and logging
  async sendEmail(to, template, data) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Email credentials not configured. Skipping email notification.');
        return { success: true, message: 'Email skipped - not configured' };
      }

      const transporter = createTransporter();
      const emailContent = emailTemplates[template](data);
      
      const mailOptions = {
        from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${template}`);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error(`❌ Email sending failed to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Notification functions
  async notifyRequestSent(requesterEmail, requesterName, requestData) {
    return await this.sendEmail(requesterEmail, 'requestSent', {
      requesterName,
      ...requestData
    });
  },

  async notifyRequestAccepted(requesterEmail, requesterName, helperName, helperEmail, requestData) {
    return await this.sendEmail(requesterEmail, 'requestAccepted', {
      requesterName,
      helperName,
      helperEmail,
      ...requestData
    });
  },

  async notifyRequestCompleted(requesterEmail, requesterName, helperName, requestData, rating = null) {
    return await this.sendEmail(requesterEmail, 'requestCompleted', {
      requesterName,
      helperName,
      rating,
      ...requestData
    });
  },

  async notifyNewMessage(recipientEmail, recipientName, senderName, messagePreview, requestId) {
    return await this.sendEmail(recipientEmail, 'newMessage', {
      recipientName,
      senderName,
      messagePreview: messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : ''),
      requestId
    });
  },

  // Test email configuration
  async testConnection() 
  {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Email service not configured - notifications will be skipped');
        return true;
      }
      
      console.log('📧 Testing email connection...');
      
      const transporter = createTransporter();
      await transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.log('📧 Email service configuration error:', error.message);
      return true;
    }
  }
};

module.exports = emailService;  