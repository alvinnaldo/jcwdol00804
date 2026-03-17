const { db, dbQuery } = require("../config/db");
const { format } = require("date-fns")

module.exports = {
  createNewOrder: async (req, res) => {
    try {
      const { items, address_id, courier, shipping_cost } = req.body;
      let invoice = "";
      const lastId = await dbQuery(
        `SELECT max(id) as last_id from JCWDOL00804.order`
      );
      if (!lastId.length) {
        invoice = `INV/${format(new Date(), "yyyyMMdd")}/XM/000000001`;
      } else {
        invoice = `INV/${format(new Date(), "yyyyMMdd")}/XM/${String(
          lastId[0].last_id + 1
        ).padStart(9, "0")}`;
      }
      db.query(
        `INSERT INTO JCWDOL00804.order SET ?`,
        {
          user_id: req.decript.id,
          address_id,
          courier,
          shipping_cost,
          invoice_no: invoice,
        },
        (err, result) => {
          if (err) {
            return res.status(500).send({
              success: false,
              message: "Failed inserting order",
            });
          }
          db.query(
            `INSERT INTO order_item (product_id, order_id, quantity) VALUES ?`,
            [
              items.map((val) => [
                val.product_id,
                result.insertId,
                val.quantity,
              ]),
            ],
            (err, result2) => {
              if (err) {
                return res.status(500).send({
                  success: false,
                  message: "Failed inserting order item",
                });
              }
              return res.status(200).send({
                success: true,
                message: "Add order item success",
                data: result.insertId,
              });
            }
          );
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  getOrderList: (req, response) => {
    const { inv, status, start_date, end_date, order, sort_by, page } =
      req.query;
    const limit = 4;
    let offset = (page - 1) * limit;
    const result = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await dbQuery(
            `SELECT b.id, MAX(c.product_img) AS product_img, MAX(d.name) AS branch_name, MAX(a.quantity) AS quantity, MAX(b.status) as status, MAX(b.invoice_no) AS invoice_no, MAX(b.created_at) AS created_at, MAX(c.name) AS name, SUM(a.quantity * c.price) AS total_purchased, COUNT(a.id) AS total_items
            FROM order_item a
            JOIN JCWDOL00804.order b ON a.order_id = b.id
            JOIN product c ON c.id = a.product_id
            JOIN branch d ON c.branch_id = d.id
            WHERE b.user_id = ${req.decript.id} 
            AND b.invoice_no LIKE '%${inv}%' 
            AND b.status LIKE '%${status}%' 
            AND b.created_at >= '${start_date} 00:00:00' 
            AND b.created_at <= '${end_date} 23:59:59' 
            GROUP BY b.id HAVING total_items <> 0 
            ORDER BY b.${sort_by} ${
              order === "true"
                ? sort_by === "created_at"
                  ? "DESC"
                  : "ASC"
                : sort_by === "created_at"
                ? "ASC"
                : "DESC"
            } LIMIT ${limit} OFFSET ${offset}`
          );
          resolve(res);
        } catch (error) {
          reject(error);
        }
      });
    };
    const allResult = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await dbQuery(
            `SELECT b.id, MAX(c.product_img) AS product_img, MAX(d.name) AS branch_name, MAX(a.quantity) as quantity, MAX(b.status) AS status, MAX(b.invoice_no) AS invoice_no, MAX(b.created_at) AS created_at, MAX(c.name) AS name, SUM(a.quantity * c.price) AS total_purchased, COUNT(a.id) AS total_items
            FROM order_item a
            JOIN JCWDOL00804.order b ON a.order_id = b.id
            JOIN product c ON c.id = a.product_id
            JOIN branch d ON c.branch_id = d.id
            WHERE b.user_id = ${req.decript.id} 
            AND b.invoice_no LIKE '%${inv}%' 
            AND b.status LIKE '%${status}%' 
            AND b.created_at >= '${start_date} 00:00:00' 
            AND b.created_at <= '${end_date} 23:59:59' 
            GROUP BY b.id HAVING total_items <> 0 
            ORDER BY b.${sort_by} ${
              order === "true"
                ? sort_by === "created_at"
                  ? "DESC"
                  : "ASC"
                : sort_by === "created_at"
                ? "ASC"
                : "DESC"
            }`
          );
          resolve(res);
        } catch (error) {
          reject(error);
        }
      });
    };
    Promise.all([result(), allResult()]).then((res) => {
      if (!res.length) {
        return response.status(404).send({
          success: false,
          message: "Order list not found",
        });
      }
      return response.status(200).send({
        result: res[0],
        limit,
        allResult: res[1],
      });
    });
  },
  getOrderDetail: (req, res) => {
    db.query(
      `SELECT a.id, a.user_id, a.status, a.courier, a.shipping_cost, a.invoice_no, a.created_at, b.address, b.city, b.province, b.zipcode 
      FROM JCWDOL00804.order a 
      JOIN address b ON a.address_id = b.id 
      WHERE a.id = ${req.params.id}
      AND a.user_id = ${req.decript.id}`,
      (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        if (!result.length) {
          return res.status(404).send({
            success: false,
            message: "Order detail not found",
          });
        }
        return res.status(200).send(result);
      }
    );
  },
  getProductInfo: (req, res) => {
    db.query(
      `SELECT a.quantity, b.name, b.price, b.product_img, c.id AS branch_id , c.name as branch_name  FROM order_item a JOIN product b ON a.product_id = b.id JOIN branch c ON b.branch_id = c.id  WHERE a.order_id = ${req.params.id}`,
      (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        if (!result.length) {
          return res.status(404).send({
            success: false,
            message: "Product info not found",
          });
        }
        return res.status(200).send(result);
      }
    );
  },
  getPayment: (req, res) => {
    db.query(
      `SELECT o.id, o.user_id, o.status, o.invoice_no, o.created_at, o.payment_img, SUM(i.quantity * p.price + o.shipping_cost) AS total_purchased
      FROM JCWDOL00804.order o
      JOIN order_item i ON i.order_id = o.id
      JOIN product p ON p.id = i.product_id
      WHERE o.id = ${req.params.id}
      AND o.user_id = ${req.decript.id}`,
      (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: err,
          });
        }
        return res.status(200).send(result);
      }
    );
  },
  uploadPaymentImg: (req, res) => {
    db.query(
      `UPDATE JCWDOL00804.order SET ? 
      WHERE id=${req.params.id}`,
      {
        payment_img: `/imgPayment/${req.files[0].filename}`,
        status: "Menunggu Konfirmasi Pembayaran",
      },
      (error, results) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: error,
          });
        }
        return res.status(200).send({
          success: true,
          message: "Successfully upload payment receipt",
        });
      }
    );
  },
  cancelOrder: (req, res) => {
    db.query(
      `UPDATE JCWDOL00804.order SET ?
      WHERE id=${req.params.id}`,
      { status: "Dibatalkan" },
      (error, results) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: error,
          });
        }
        return res.status(200).send({
          success: true,
          message: "Order canceled",
        });
      }
    );
  },
};
