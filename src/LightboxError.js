class LightboxError extends Error {
    constructor(...args) {
        super(...args);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LightboxError);
        }
    }
}

export default LightboxError;
