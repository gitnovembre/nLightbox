module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "indent": ["error", 4],
        "no-underscore-dangle": 0,
        "arrow-parens": [2, "always"],
        "max-len": ["error", { "comments": 200, "code": 200, }]
    },
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
    },
};