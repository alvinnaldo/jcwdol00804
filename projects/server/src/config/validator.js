const { check, validationResult } = require("express-validator");
const { db, dbQuery } = require("./db");

module.exports = {
  validateSignUp: async (req, res, next) => {
    try {
      await check("name").isString().notEmpty().run(req),
        await check("email")
          .isString()
          .notEmpty()
          .isEmail()
          .withMessage("Invalid email format")
          .run(req),
        await check("phone")
          .isString()
          .notEmpty()
          .matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g)
          .withMessage("Invalid phone number")
          .run(req),
        await check("password")
          .isString()
          .isLength({ min: 8 })
          .withMessage("Should more than 8 characters")
          .matches(/[a-z]/g)
          .withMessage("Should contain at least 1 lower case letter")
          .matches(/[A-Z]/g)
          .withMessage("Should contain at least 1 upper case letter")
          .matches(/[0-9]/g)
          .withMessage("Should contain at least 1 number")
          .run(req);
      await check("confirmpassword")
        .isString()
        .notEmpty()
        .equals(req.body.password)
        .withMessage("Password doesn't match")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateForgot: async (req, res, next) => {
    try {
      await check("email")
        .isString()
        .notEmpty()
        .isEmail()
        .withMessage("Invalid email format")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateNewPass: async (req, res, next) => {
    try {
      await check("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Should more than 8 characters")
        .matches(/[a-z]/g)
        .withMessage("Should contain at least 1 lower case letter")
        .matches(/[A-Z]/g)
        .withMessage("Should contain at least 1 upper case letter")
        .matches(/[0-9]/g)
        .withMessage("Should contain at least 1 number")
        .run(req);
      await check("confirmpassword")
        .isString()
        .notEmpty()
        .equals(req.body.password)
        .withMessage("Password doesn't match")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateSignIn: async (req, res, next) => {
    try {
      await check("email")
        .isString()
        .notEmpty()
        .isEmail()
        .withMessage("Invalid email format")
        .run(req);
      await check("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Should more than 8 characters")
        .matches(/[a-z]/g)
        .withMessage("Should contain at least 1 lower case letter")
        .matches(/[A-Z]/g)
        .withMessage("Should contain at least 1 upper case letter")
        .matches(/[0-9]/g)
        .withMessage("Should contain at least 1 number")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateSignIn: async (req, res, next) => {
    try {
      await check("email")
        .isString()
        .notEmpty()
        .isEmail()
        .withMessage("Invalid email format")
        .run(req);
      await check("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Should more than 8 characters")
        .matches(/[a-z]/g)
        .withMessage("Should contain at least 1 lower case letter")
        .matches(/[A-Z]/g)
        .withMessage("Should contain at least 1 upper case letter")
        .matches(/[0-9]/g)
        .withMessage("Should contain at least 1 number")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  validateEditProfile: async (req, res, next) => {
    try {
      await check("name").isString().notEmpty().run(req);
      await check("email")
        .isString()
        .notEmpty()
        .isEmail()
        .withMessage("Invalid email format")
        .run(req);
      await check("birthdate")
        .isDate()
        .custom((value) => {
          if (new Date(value) >= new Date()) {
            throw new Error(
              `Birthdate cannot beyond ${new Date().toLocaleDateString("id")}`
            );
          }
          return true;
        })
        .optional({ nullable: true })
        .run(req);
      await check("gender")
        .isIn(["male", "female"])
        .optional({ nullable: true })
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  validateAddToCart: async (req, res, next) => {
    try {
      const stock = await dbQuery(
        `SELECT stock from product WHERE id=${req.body.product_id}`
      );
      const prevQty = await dbQuery(
        `SELECT quantity from cart_item WHERE cart_id=${req.decript.cart_id} AND product_id=${req.body.product_id}`
      );
      await check("quantity")
        .isNumeric()
        .notEmpty()
        .custom((value) => {
          if (
            value + (prevQty.length ? prevQty[0].quantity : 0) >
            stock[0].stock
          ) {
            throw new Error("Quantity can not exceeds stock");
          }
          return true;
        })
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  validateForgot: async (req, res, next) => {
    try {
      await check("email")
        .isString()
        .notEmpty()
        .isEmail()
        .withMessage("Invalid email format")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateNewPass: async (req, res, next) => {
    try {
      await check("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Should more than 8 characters")
        .matches(/[a-z]/g)
        .withMessage("Should contain at least 1 lower case letter")
        .matches(/[A-Z]/g)
        .withMessage("Should contain at least 1 upper case letter")
        .matches(/[0-9]/g)
        .withMessage("Should contain at least 1 number")
        .run(req);
      await check("confirmpassword")
        .isString()
        .notEmpty()
        .equals(req.body.password)
        .withMessage("Password doesn't match")
        .run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  validateAddOrEditProduct: async (req, res, next) => {
    try {
      const categoryList = await dbQuery(`SELECT name AS category_name
      FROM category WHERE is_delete=0 AND branch_id=${req.decript.branch_id}`);
      await check("category")
        .isIn(categoryList.map((val) => val.category_name))
        .notEmpty()
        .run(req);
      await check("product_name").isString().isLength({max : 45}).notEmpty().run(req);
      await check("description")
        .isString()
        .isLength({ max: 255 })
        .optional({ nullable: true })
        .run(req);
      await check("price").isNumeric().notEmpty().run(req);
      await check("weight").isNumeric().notEmpty().run(req);
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "Validation invalid ❌",
          error: validation.errors,
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
