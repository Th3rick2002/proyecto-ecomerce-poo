import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Not Found") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict") {
        super(message, 409);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (!(err instanceof AppError)) {
        const msg = message.toLowerCase();
        
        if (msg.includes("not found")) {
            statusCode = 404;
        } else if (msg.includes("already exists") || msg.includes("conflict") || msg.includes("unique constraint")) {
            statusCode = 409;
        } else if (msg.includes("unauthorized") || msg.includes("invalid token") || msg.includes("login failed")) {
            statusCode = 401;
        } else if (msg.includes("forbidden") || msg.includes("permission denied")) {
            statusCode = 403;
        } else if (msg.includes("bad request") || msg.includes("invalid") || msg.includes("validation") || msg.includes("bad data")) {
            statusCode = 400;
        }
    }

    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        status: "error",
        statusCode: statusCode,
        message: message,
    });
};
