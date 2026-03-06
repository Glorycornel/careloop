module.exports = {
  extends: ["universe/native", "universe/shared/prettier"],
  parserOptions: {
    project: "./tsconfig.json"
  },
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
