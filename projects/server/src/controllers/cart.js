const { db, dbQuery } = require("../config/db");

module.exports = {
  getCartList: (req, res) => {
    db.query(
      `SELECT y.*, z.name, z.description, z.price, z.stock, z.weight, z.category_id, z.product_img, z.is_delete, b.name as branch_name, b.city as branch_cityname FROM cart x JOIN cart_item y ON x.id = y.cart_id JOIN product z ON y.product_id = z.id JOIN branch b ON z.branch_id = b.id WHERE x.user_id = ${req.decript.id} AND y.is_delete = 0;`,
      (err, result) => {
        if (err) {
          return res.status(404).send({
            success: false,
            message: "Cart item empty",
          });
        }
        return res.status(200).send(result);
      }
    );
  },
  initCartUser: (req, res) => {
    db.query(
      `SELECT id from user WHERE email=${db.escape(req.body.email)}`,
      (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        db.query(
          `INSERT INTO cart SET ?`,
          { user_id: result[0].id },
          (err2, result2) => {
            if (err2) {
              return res.status(500).send({
                success: false,
                message: err2,
              });
            }
            // Use result2.insertId which contains the ID of the newly inserted cart
            db.query(
              `UPDATE user SET ? WHERE id=${result[0].id}`,
              { cart_id: result2.insertId },
              (err3, result3) => {
                if (err3) {
                  return res.status(500).send({
                    success: false,
                    message: err3,
                  });
                }
                return res.status(200).send({
                  success: true,
                  message: "Initialized New Cart for New User",
                });
              }
            );
          }
        );
      }
    );
  },
  addToCart: async (req, res) => {
    try {
      const { quantity, product_id } = req.body;
      const checkItem = await dbQuery(
        `SELECT quantity from cart_item WHERE cart_id=${req.decript.cart_id} AND product_id=${product_id} AND is_delete=0`
      );
      if (checkItem.length) {
        db.query(
          `UPDATE cart_item SET ? WHERE cart_id=${req.decript.cart_id} AND product_id=${product_id} AND is_delete=0`,
          { quantity: quantity + checkItem[0].quantity },
          (err, result2) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: err,
              });
            }
            return res.status(200).send({
              success: true,
              message: `Add ${quantity} item to cart success`,
            });
          }
        );
      } else {
        db.query(
          `INSERT INTO cart_item SET ?`,
          { quantity, cart_id: req.decript.cart_id, product_id },
          (err, result3) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: err,
              });
            }
            return res.status(201).send({
              success: true,
              message: "Add item to cart success",
            });
          }
        );
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  updateCartQuantity: async (req, res) => {
    try {
      const { type, id, product_id } = req.body;
      const stock = await dbQuery(
        `SELECT stock from product WHERE id=${product_id}`
      );
      const qty = await dbQuery(
        `SELECT quantity from cart_item WHERE id=${id}`
      );
      if (type === "increment") {
        if (qty[0].quantity >= stock[0].stock) {
          return res.status(400).send({
            success: false,
            message: "Quantity can not exceeds stock",
          });
        }
        db.query(
          `UPDATE cart_item SET quantity=quantity+1 WHERE id=${id}`,
          (err, result) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: err,
              });
            }
            return res.status(200).send({
              success: true,
              message: "Update cart increment item quantity success",
            });
          }
        );
      } else if (type === "decrement") {
        if (qty[0].quantity <= 1) {
          return res.status(400).send({
            success: false,
            message: "Quantity can not be 0",
          });
        }
        db.query(
          `UPDATE cart_item SET quantity=quantity-1 WHERE id=${id}`,
          (err, result) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: err,
              });
            }
            return res.status(201).send({
              success: true,
              message: "Update cart decrement item quantity success",
            });
          }
        );
      } else {
        return res.status(400).send({
          success: false,
          message: "Type of update is not specified",
        });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  deleteFromCart: (req, res) => {
    const { id } = req.body;
    db.query(
      `UPDATE cart_item SET ? WHERE id=${id}`,
      { is_delete: 1 },
      (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        return res.status(200).send({
          success: true,
          message: "Delete item from cart success",
        });
      }
    );
  },
  replaceCart: (req, res) => {
    const { quantity, product_id } = req.body;
    db.query(
      `UPDATE cart_item SET ? WHERE cart_id=${req.decript.cart_id}`,
      { is_delete: 1 },
      (error, result) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        db.query(
          `INSERT INTO cart_item SET ?`,
          { quantity, cart_id: req.decript.cart_id, product_id },
          (error, result) => {
            if (error) {
              return res.status(500).send({
                success: false,
                message: err,
              });
            }
            return res.status(201).send({
              success: true,
              message:
                "Previous cart item deleted, add new item to cart success",
            });
          }
        );
      }
    );
  },
  deleteCartItemAfterOrder: async (req, res) => {
    try {
      const { items } = req.body;
      const deleteItem = (product_id) => {
        return new Promise(async (resolve, reject) => {
          try {
            db.query(
              `UPDATE cart_item SET ? WHERE product_id = ${product_id} AND cart_id=${req.decript.cart_id}`,
              { is_delete: 1 },
              (err, result) => {
                if (err) throw new Error(err);
                resolve(true);
              }
            );
          } catch (error) {
            reject(error);
          }
        });
      };
      Promise.all(
        items.map(async (val) => {
          let result = await deleteItem(val.product_id);
          return result;
        })
      )
        .then(() => {
          return res.status(200).send({
            success: true,
            message: "Delete cart item after order success",
          });
        })
        .catch((err) => {
          return res.status(500).send({
            success: false,
            message: "Delete cart item failed",
          });
        });
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
