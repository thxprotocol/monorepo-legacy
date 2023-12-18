import { ethers } from 'ethers';
import { THXError } from './errors';
import { logger } from './logger';

export class ExpectedEventNotFound extends THXError {
    constructor(event: string) {
        super(`Event ${event} expected in eventlog but not found.`);
    }
}

export function parseArgs(args: any) {
    const returnValues: any = {};
    for (const key of Object.keys(args)) {
        if (isNaN(Number(key))) {
            returnValues[key] = args[key];
        }
    }
    return returnValues;
}

export function parseLog(abi: any, log: any) {
    const contractInterface = new ethers.utils.Interface(abi);
    try {
        return contractInterface.parseLog(log);
    } catch (e) {
        logger.error(e.toString());
        return;
    }
}

export function hex2a(hex: any) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const v = parseInt(hex.substr(i, 2), 16);
        if (v == 8) continue; // http://www.fileformat.info/info/unicode/char/0008/index.htm
        if (v == 15) continue;
        if (v == 16) continue; // http://www.fileformat.info/info/unicode/char/0010/index.htm
        if (v == 14) continue; // https://www.fileformat.info/info/unicode/char/000e/index.htm
        if (v) str += String.fromCharCode(v);
    }
    return str.trim();
}

export function findEvent(eventName: string, events: CustomEventLog[]): CustomEventLog {
    return events.find((ev: any) => ev && ev.name === eventName);
}

export function assertEvent(eventName: string, events: CustomEventLog[]): CustomEventLog {
    const event = findEvent(eventName, events);

    if (!event) {
        throw new ExpectedEventNotFound(eventName);
    }

    return event;
}

export interface CustomEventLog {
    name: string;
    args: any;
    blockNumber: number;
    transactionHash: string;
}

export function parseLogs(abi: any, logs: any = []): CustomEventLog[] {
    const contractInterface = new ethers.utils.Interface(abi);
    return logs.map((log: any) => {
        try {
            return { ...log, ...contractInterface.parseLog(log) };
        } catch (e) {
            return;
        }
    });
}
