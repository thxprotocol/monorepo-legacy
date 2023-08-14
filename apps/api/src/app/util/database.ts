import mongoose from 'mongoose';
import { logger } from './logger';
import { v4 } from 'uuid';

const connect = async (url: string) => {
    mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    });

    mongoose.connection.on('reconnectFailed', () => {
        logger.error('Unable to reconnect to MongoDB');
        process.exit();
    });

    mongoose.connection.on('open', () => {
        logger.info(`MongoDB successfully connected to ${url.split('@')[1]}`);
    });

    mongoose.connection.on('close', () => {
        logger.info(`MongoDB successfully closed connection`);
    });

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
};

const truncate = async () => {
    if (mongoose.connection.readyState !== 0) {
        const { collections } = mongoose.connection;
        const promises = Object.keys(collections).map((collection) => {
            return mongoose.connection.collection(collection).deleteMany({});
        });
        await Promise.all(promises);
    }
};

const readyState = () => {
    return mongoose.connection.readyState;
};

const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

const createUUID = () => {
    return v4();
};

export default {
    connect,
    truncate,
    disconnect,
    readyState,
    connection: mongoose.connection,
    createUUID,
};
