// database.js : initiates sequelize object to connect to database

const pg  = require('pg');
const { Sequelize, DataTypes,  } = require('sequelize');
const bcrypt = require('bcrypt');
const logger = require('./logger.js');



const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USERNAME,
    process.env.PASSWORD, {
        "host": process.env.HOST,
        "port": process.env.DB_PORT,
        "dialect": process.env.DIALECT,
    });

// Define user model as per database

const User = sequelize.define('User', {

    id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        noUpdate: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        noUpdate: true,
        unique: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    account_created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    account_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    verificationToken: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_verified: {
        type: Boolean,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: false,
    schema: 'public'
});


async function initializeDatabase() {
    try {
        await User.sync()
            .then((value) => {
                logger.info("Database connection established!");
            })
            .catch((err) => {
                logger.error("Database connection Failed: ", err);
            })
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}
initializeDatabase();


module.exports = { User, sequelize};
