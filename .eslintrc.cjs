"use strict";

/** @type {import('@typescript-eslint/utils').TSESLint.Linter.ConfigType} */
module.exports = {
  extends: [`plugin:deprecation/recommended`, `@ryb73`],

  rules: {
    "@typescript-eslint/parameter-properties": `off`,
    "max-classes-per-file": `off`,
    "sort-class-members/sort-class-members": `off`,
    "unused-imports/no-unused-vars": [
      `warn`,
      {
        vars: `all`,
        varsIgnorePattern: `^_`,
        args: `all`,
        argsIgnorePattern: `^_`,
      },
    ],
  },
};
