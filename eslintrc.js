module.exports = {
    "extends": "airbnb-base",
    "settings": {
        "import/resolver": {
            "webpack": {
                "images": "./src/assets/images",
                "coreJS": "express-core/src/assets",
            },
        },
    },
    "rules": {
        "indent": ["error", 4]
    },
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
    },
};
