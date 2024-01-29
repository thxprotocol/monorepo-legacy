class THXError extends Error {
    message: string;

    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

class NoUserFound extends THXError {
    constructor() {
        super('Could not find a user for this address');
    }
}

class NotAMemberError extends THXError {
    constructor(address: string, assetPool: string) {
        super(`${address} is not a member of assetPool ${assetPool}`);
    }
}
class AlreadyAMemberError extends THXError {
    constructor(address: string, assetPool: string) {
        super(`${address} is already a member of assetPool ${assetPool}`);
    }
}

class NoDataAtAddressError extends THXError {
    constructor(address: string) {
        super(`No data found at address ${address}`);
    }
}

class THXHttpError extends THXError {
    status: number;
    constructor(message?: string, status?: number) {
        super(message);
        if (status) {
            this.status = status;
        }
    }
}

class BadRequestError extends THXHttpError {
    status = 400;
    constructor(message?: string) {
        super(message || 'Bad Request');
    }
}

class UnauthorizedError extends THXHttpError {
    status = 401;
    constructor(message?: string) {
        super(message || 'Unauthorized');
    }
}

class ForbiddenError extends THXHttpError {
    status = 403;
    constructor(message?: string) {
        super(message || 'Forbidden');
    }
}

class NotFoundError extends THXHttpError {
    status = 404;
    constructor(message?: string) {
        super(message || 'Not Found');
    }
}

class ConflictError extends THXHttpError {
    status = 409;
    constructor(message?: string) {
        super(message || 'Conflict');
    }
}

class InternalServerError extends THXHttpError {
    status = 500;
    constructor(message?: string) {
        super(message || 'Internal Server Error');
    }
}

class NotImplementedError extends THXHttpError {
    status = 501;
    constructor(message?: string) {
        super(message || 'Not Implemented');
    }
}

class BadGatewayError extends THXHttpError {
    status = 502;
    constructor(message?: string) {
        super(message || 'Bad Gateway');
    }
}

class PromoCodeNotFoundError extends NotFoundError {
    message = 'Could not find this promo code';
}

class SubjectUnauthorizedError extends ForbiddenError {
    message = 'Not authorized for subject of access token';
}

class AudienceUnauthorizedError extends UnauthorizedError {
    message = 'Not authorized for audience of access token';
}

class AmountExceedsAllowanceError extends BadRequestError {
    message = 'Transfer amount exceeds allowance';
}

class InsufficientBalanceError extends BadRequestError {
    message = 'Transfer amount exceeds balance';
}

class InsufficientAllowanceError extends BadRequestError {
    message = 'Requested amount exceeds allowance';
}

class TokenPaymentFailedError extends InternalServerError {
    message = 'Transfer did not succeed';
}
class GetPastTransferEventsError extends InternalServerError {
    message = 'GetPastEvents for Transfer event failed in callback.';
}
class GetPastWithdrawnEventsError extends InternalServerError {
    message = 'GetPastEvents for Withdrawn event failed in callback.';
}

class DuplicateEmailError extends BadRequestError {
    message = 'An account with this e-mail address already exists.';
}

class GetPastWithdrawPollCreatedEventsError extends InternalServerError {
    message = 'GetPastEvents for WithdrawPollCreated event failed in callback.';
}
class MaxFeePerGasExceededError extends THXError {
    message = 'MaxFeePerGas from oracle exceeds configured cap';
}
class NoFeeDataError extends THXError {
    message = 'Could not get fee data from oracle';
}

class DiscordDisconnected extends THXError {
    message = 'Please sign in to your THX account and connect your Discord account.';
}

class DiscordSafeNotFound extends THXError {
    message = 'Please sign in to your THX account so we can deploy your Safe multisig wallet.';
}

export {
    DiscordSafeNotFound,
    DiscordDisconnected,
    THXError,
    NoUserFound,
    THXHttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    NotImplementedError,
    BadGatewayError,
    InternalServerError,
    PromoCodeNotFoundError,
    SubjectUnauthorizedError,
    AudienceUnauthorizedError,
    AmountExceedsAllowanceError,
    InsufficientBalanceError,
    TokenPaymentFailedError,
    GetPastTransferEventsError,
    GetPastWithdrawnEventsError,
    DuplicateEmailError,
    GetPastWithdrawPollCreatedEventsError,
    NotAMemberError,
    AlreadyAMemberError,
    NoDataAtAddressError,
    MaxFeePerGasExceededError,
    InsufficientAllowanceError,
    NoFeeDataError,
};
