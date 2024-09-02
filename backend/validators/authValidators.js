const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be between 4 and 20 characters"),
  body("password")
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*_+])/)
    .withMessage(
      "Password must include an uppercase letter and a special symbol (!@#$%^&*_+)"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const loginValidator = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidator = [
  body("username")
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be between 4 and 20 characters"),
  body("newPassword")
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*_+])/)
    .withMessage(
      "Password must include an uppercase letter and a special symbol (!@#$%^&*_+)"
    ),
  body("confirmNewPassword")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
};
