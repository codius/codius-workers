/** @type {import("prettier").Config} */
export default {
  // .astro files don't work with the sort-imports plugin
  // https://github.com/trivago/prettier-plugin-sort-imports/issues/210
  plugins: ["prettier-plugin-astro", "@trivago/prettier-plugin-sort-imports"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  semi: false,
}
