/** Tailwind build for the static site. Re-run `npm run build:css` after adding classes. */
module.exports = {
  // Dark mode follows the html.dark class set by the toggle, not the OS preference.
  darkMode: "class",
  content: ["./index.html", "./static/js/**/*.js"],
};
