
const { v4: uuidv4 } = require('uuid');
const { User, sequelize } = require('./database.js');
const logger = require('./logger.js');
const cors = require('cors');


const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const mailgun = require('mailgun-js')({
    apiKey: process.env.API_KEY,
    domain: process.env.DOMAIN
});




const token = uuidv4();
const expiry = new Date(new Date().getTime() + 2 * 60 * 1000);

exports.sendEmail = async (event, context) => {
    logger.info("Sending Verification Email");
	logger.debug("event",event);

    const pubsubMessage = event.data;

    const data = pubsubMessage ? Buffer.from(pubsubMessage, 'base64').toString() : null;
    logger.info("Request" + data.account);

	// const data = pubsubMessage
    // logger.info("Request" + JSON.stringify(data.account, null, 2));

    if (data) {
        const mailOptions = {
            from: "user_verification@anibahscsye6225.me",
            to: data.account.username,
            subject: 'Verify your new account!',
            text: 'Visit this http://anibahscsye6225.me:8080/v1/user/verifyEmail/' + data.account.username + "/" + token,
            html: '<a href="http://anibahscsye6225.me:8080/v1/user/verifyEmail/' + data.account.username + "/" + token + '"><H2>Click here to verify your account!</H2></a>'
        };
        try {
            const selfUser = await User.findOne({
            where: {
                username: data.account.username
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
                    username: data.account.username
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
        }
    } else {
        console.error('Invalid PubSub');
        logger.error('Invalid PubSub');
	}
};