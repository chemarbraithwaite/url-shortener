module.exports = {
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  preset: "jest-dynalite",
  setupFiles: ["./test/setup.ts"],
};
