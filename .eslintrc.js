module.exports = {
    env: {
        browser: true,
        commonjs: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:node/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    settings: {
        node: {
            tryExtensions: [".js", ".json", ".node", ".ts", ".d.ts"],
        },
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "linebreak-style": ["error", "windows"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "node/no-unsupported-features/es-syntax": ["error", { version: ">=14.0.0", ignores: ["modules"] }],
    },
};
