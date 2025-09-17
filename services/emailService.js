const transporter = require('../config/emailConfig');

const emailService = {
    // Send driver booking notification
    sendDriverBookingEmail: async (driverEmail, bookingDetails) => {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'fleet@cbz.co.zw',
                to: driverEmail,
                subject: '🚗 New Trip Assignment - CBZ Fleet Management',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #0047AB; color: white; padding: 20px; text-align: center; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
                            .details { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
                            .footer { text-align: center; margin-top: 20px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>CBZ Fleet Management System</h2>
                                <h3>New Trip Assignment</h3>
                            </div>
                            <div class="content">
                                <p>Hello Driver,</p>
                                <p>You have been assigned a new trip. Here are the details:</p>
                                
                                <div class="details">
                                    <h4>📋 Trip Details</h4>
                                    <p><strong>Passenger:</strong> ${bookingDetails.passengerName}</p>
                                    <p><strong>Contact:</strong> ${bookingDetails.passengerContact}</p>
                                    <p><strong>Pickup Location:</strong> ${bookingDetails.pickupLocation}</p>
                                    <p><strong>Destination:</strong> ${bookingDetails.destination}</p>
                                    <p><strong>Pickup Time:</strong> ${new Date(bookingDetails.scheduledPickupTime).toLocaleString('en-ZW')}</p>
                                    ${bookingDetails.purpose ? `<p><strong>Purpose:</strong> ${bookingDetails.purpose}</p>` : ''}
                                </div>

                                <div class="details">
                                    <h4>🚗 Vehicle Details</h4>
                                    <p><strong>Vehicle:</strong> ${bookingDetails.vehicleMake} ${bookingDetails.vehicleModel}</p>
                                    <p><strong>Registration:</strong> ${bookingDetails.vehicleRegistration}</p>
                                </div>

                                <p>Please ensure you arrive at the pickup location 10 minutes before the scheduled time.</p>
                                <p>If you have any questions, contact your fleet manager.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated message. Please do not reply to this email.</p>
                                <p>© ${new Date().getFullYear()} CBZ Fleet Management System</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('✅ Booking email sent to:', driverEmail);
            return result;
        } catch (error) {
            console.error('❌ Error sending email:', error);
            throw error;
        }
    }
};

module.exports = emailService;