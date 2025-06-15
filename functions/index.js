const {onRequest} = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const logger = require("firebase-functions/logger");
const cors = require('cors')({origin: true});

// Initialize the app if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create an HTTP function that doesn't require authentication
exports.sendNotificationHttp = onRequest({
  // Limit this function to one call per second
  minInstances: 0,
  maxInstances: 2,
  timeoutSeconds: 60,
}, (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    try {
      // Check for POST method
      if (req.method !== 'POST') {
        res.status(405).send({error: 'Method not allowed. Please use POST.'});
        return;
      }
      
      // Log request for debugging
      logger.info('Request received:', req.body);
      
      // Get the parameters from the request body
      const { token, title, body, customData } = req.body;
      
      // Check for required fields
      if (!token || !title || !body) {
        res.status(400).send({error: 'Missing required fields: token, title, body'});
        return;
      }
      
      // Create the message
      const message = {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        // Add optional custom data
        data: customData || {},
      };
      
      // Send the notification
      const response = await admin.messaging().send(message);
      logger.info('Notification sent successfully:', response);
      
      // Return success response
      res.status(200).send({
        success: true,
        messageId: response
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).send({
        error: error.message
      });
    }
  });
});