/* eslint-disable @typescript-eslint/ban-types */
import ErrorCode from './ErrorCode';

const MESSAGE: { [key: string]: string | Function } = {
  [ErrorCode.NOT_IMPLEMENTED]: (what: string, name: string) =>
    `Method ${what} not implemented on ${name}.`,
  [ErrorCode.SIGN_IN_REQUIRED]: 'You need to call signin method before able to beform this',
};

export default MESSAGE;
