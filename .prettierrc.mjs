/** @type {import("prettier").Config} */
export default {
  useTabs: false,
  printWidth: 120,
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
