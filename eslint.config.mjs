import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsx from "eslint-plugin-jsx-a11y";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        fetch: "readonly",
        confirm: "readonly",
        alert: "readonly",
        prompt: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        File: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        FormData: "readonly",
        Event: "readonly",
        MouseEvent: "readonly",
        Node: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Response: "readonly",
        Headers: "readonly",
        Blob: "readonly",
        TextEncoder: "readonly",
        // Node.js globals for API routes
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsx,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in modern React
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/no-unescaped-entities": "off", // Allow unescaped quotes in JSX text
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off", // Allow console statements for debugging
      "prefer-const": "error",
      "no-var": "error",
      "no-undef": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["node_modules/", "dist/", ".astro/", "**/*.astro"],
  },
];