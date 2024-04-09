const functions = require('@google-cloud/functions-framework');
const { v4: uuidv4 } = require('uuid');
const { User, sequelize } = require('./database.js');
const logger = require('./logger.js');


const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const mailgun = require('mailgun-js')({
    apiKey: process.env.API_KEY,
    domain: process.env.DOMAIN
});



// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('sendEmail', async cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
    const base64user = cloudEvent.data.message.data;
    const userJSON = Buffer.from(base64user, 'base64').toString();
    const user = JSON.parse(userJSON);


  	console.log("is it a buffer stream:", user);
    if (!user || !user.account || !user.account.username) {
        console.error('Invalid PubSub message');
        logger.error('Invalid PubSub message');
        return;
    }

  	const token = uuidv4();
	const expiry = new Date(new Date().getTime() + 2 * 60 * 1000);

	if (user) {
        const mailOptions = {
            from: "user_verification@anibahscsye6225.me",
            to: user.account.username,
            subject: 'CSYE6225 Verify your webapp account',
            text: 'Visit this http://anibahscsye6225.me/v1/user/verifyEmail/' + user.account.username + "/" + token,
            html: '<a href="http://anibahscsye6225.me/v1/user/verifyEmail/' + user.account.username + "/" + token + '"><H2>Click here to verify your account.</H2></a>'
        };
        try {
            const selfUser = await User.findOne({
            where: {
                username: user.account.username
            }
            });

            if (!selfUser) {
                console.error("User not found");
                logger.error("User not found");
            }

            logger.debug("Found User", selfUser.dataValues)
            console.log("Found User", selfUser.dataValues);


            var updateAtt = selfUser.dataValues;
            updateAtt.verificationToken = token;
            updateAtt.verificationExpiry = expiry;

            logger.debug("Updating User with ", updateAtt)
            console.log("Updating User with ", updateAtt);

            const result = await User.update(updateAtt, {
                where: {
                    username: user.account.username
                },
            		returning: true,
            });
			if(result[0]<=0){
				console.error("Updated failed");
			}
            console.log("result",result);

            const sent = await mailgun.messages().send(mailOptions);
            console.log("Mail Sent", sent);
            logger.info("Mail Sent", sent);
        } catch (err) {
            logger.error(err);
            console.error(err);
        }
    } else {
        console.error('Invalid PubSub');
        logger.error('Invalid PubSub');
	}
});