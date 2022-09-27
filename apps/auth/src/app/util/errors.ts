class THXError extends Error {
    message: string;

    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
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

class UnprocessableEntityError extends THXHttpError {
    status = 422;
    constructor(message?: string) {
        super(message || 'Unprocessable Entity');
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

export {
    THXError,
    THXHttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    UnprocessableEntityError,
    NotImplementedError,
    BadGatewayError,
    InternalServerError,
};
