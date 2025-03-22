const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');


const SendSms =async(phoneNumber,message) =>{
    const snsClient = new SNSClient({
        region: 'eu-north-1',
        credentials: {
          accessKeyId: 'AKIA6GBMFKPRFA7Z35W4',
          secretAccessKey: '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',
        },
      });      
    try {
        // Create the publish parameters
        const params = {
          Message: message,           
          PhoneNumber: phoneNumber, 
        };
    
        // Send the message
        const command = new PublishCommand(params);
        const response = await snsClient.send(command);
    
        console.log('Message sent! MessageId:', response.MessageId);
        return response
      } catch (error) {
        console.error('Error sending message:', error);
      }
}

module.exports = SendSms