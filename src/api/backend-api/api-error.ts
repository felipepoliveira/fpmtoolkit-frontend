import { AxiosError } from "axios";

export type ErrorType =
    | "DUPLICATED"
    | "EMAIL_NOT_CONFIRMED"
    | "FORBIDDEN"
    | "INVALID_CREDENTIALS"
    | "INVALID_EMAIL"
    | "INVALID_PARAMETERS"
    | "INVALID_PASSWORD"
    | "NOT_FOUND"
    | "PAYMENT_REQUIRED"
    | "TOO_MANY_REQUESTS"
    | "VALIDATION"
    |
    "UNKNOWN";


export default class ApiError {

    httpStatusCode: number;
    errorType: ErrorType;

    constructor(errorSource: AxiosError) {
        // check for error types
        if (errorSource.response?.headers["x-error"]) {
            this.errorType = errorSource.response.headers["x-error"] as ErrorType;
        }
        else {
            this.errorType = "UNKNOWN";
        }

        this.httpStatusCode = errorSource.response?.status || 0;

    }
}