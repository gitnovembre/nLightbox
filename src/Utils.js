/**
 * Hashmark detection
 */
const getHashmarkParameters = () => {
    const hashmark = window.location.hash.substr(1);
    const regex = /&?([a-z])=([a-zA-Z0-9_-]*)/g;

    const result = {};

    // read URL fragment
    let match = regex.exec(hashmark);
    while (match != null) {
        const key = match[1] || undefined;
        const value = match[2] || undefined;

        if (key && value) {
            result[key] = value;
        }
        match = regex.exec(hashmark);
    }
    return result;
};

const randomInt = (a, b) => {
    const min = Math.ceil(a);
    const max = Math.floor(b);
    return Math.floor(Math.random() * (max - min)) + min;
};

export default {
    getHashmarkParameters,
    randomInt,
};
