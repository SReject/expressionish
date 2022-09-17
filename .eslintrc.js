module.exports = {
    "extends": [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    "parser": '@typescript-eslint/parser',
    "plugins": [
        '@typescript-eslint'
    ],
    "env": {
        "node": true,
        "es2020": true
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "linebreak-style": ["error", "unix"]
    },

    "ignorePatterns": [
        "node_modules/",
        "lib/",
        "test/",
    ]
}