class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // Set the error message properly
        this.statusCode = statusCode; // Correct property name
    }
}

module.exports = ExpressError;
