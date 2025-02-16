/* eslint-env node */
module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        // 'prettier',
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    plugins: ["@typescript-eslint"],
    root: true,
    rules: {
        "no-console": "error",
        "dot-notation": "error",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/require-await": "off",
        // Todo: Below two rule should be removable
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
    },
};
