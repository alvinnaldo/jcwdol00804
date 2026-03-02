const { db, dbQuery } = require("../config/db");

module.exports = {
  orderListBranchAdmin: (req, response) => {
    const {
      inv,
      status,
      user_name,
      start_date,
      end_date,
      order,
      sort_by,
      page,
    } = req.query;
    let limit = 4;
    let offset = (page - 1) * limit;
    const result = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await dbQuery(
            `SELECT b.id, MAX(e.name) AS user_name, MAX(c.product_img) AS product_img, MAX(d.name) AS branch_name, MAX(a.quantity) AS quantity, MAX(b.status) AS status, MAX(b.invoice_no) AS invoice_no, MAX(b.created_at) AS created_at, MAX(c.name) AS name, SUM(a.quantity * c.price) AS total_purchased, COUNT(a.id) AS total_items FROM order_item a JOIN JCWDOL00804.order b ON a.order_id = b.id JOIN product c ON c.id = a.product_id JOIN branch d ON c.branch_id = d.id JOIN user e ON b.user_id = e.id WHERE d.id = ${
              req.decript.branch_id
            } AND b.invoice_no LIKE '%${inv}%' AND b.status LIKE '%${status}%' AND e.name LIKE '%${user_name}%' AND b.created_at >= '${start_date} 00:00:00' AND b.created_at <= '${end_date} 23:59:59' GROUP BY b.id HAVING total_items <> 0 ORDER BY b.${sort_by} ${
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
            `SELECT b.id, MAX(e.name) AS user_name, MAX(c.product_img) AS product_img, MAX(d.name) AS branch_name, MAX(a.quantity) AS quantity, MAX(b.status) AS status, MAX(b.invoice_no) AS invoice_no, MAX(b.created_at) AS created_at, MAX(c.name) AS name, SUM(a.quantity * c.price) AS total_purchased, COUNT(a.id) AS total_items
                        FROM order_item a
                        JOIN JCWDOL00804.order b ON a.order_id = b.id
                        JOIN product c ON c.id = a.product_id
                        JOIN branch d ON c.branch_id = d.id
                        JOIN user e ON b.user_id = e.id
                        WHERE d.id = ${req.decript.branch_id}
                        AND b.invoice_no LIKE '%${inv}%' 
                        AND b.status LIKE '%${status}%' 
                        AND e.name LIKE '%${user_name}%'
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
  orderDetailBranchAdmin: (req, res) => {
    db.query(
      `SELECT a.id, c.name AS user_name, a.payment_img, a.status, a.courier, a.shipping_cost, a.invoice_no, a.created_at, b.address, b.city, b.province, b.zipcode 
            FROM JCWDOL00804.order a 
            JOIN address b ON a.address_id = b.id 
            JOIN user c ON a.user_id = c.id
            WHERE a.id = ${db.escape(req.params.id)};`,
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
      `SELECT a.quantity, b.name, b.price, b.product_img, c.id AS branch_id , c.name as branch_name 
            FROM order_item a 
            JOIN product b ON a.product_id = b.id 
            JOIN branch c ON b.branch_id = c.id 
            WHERE a.order_id = ${db.escape(req.params.id)}`,
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
  acceptPayment: (req, res) => {
    try {
      db.query(
        `UPDATE JCWDOL00804.order SET ?
                WHERE id=${req.params.id}`,
        { status: "Diproses" },
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          return res.status(200).send({
            success: true,
            message: "Payment Receipt Accepted",
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  refusePayment: (req, res) => {
    try {
      db.query(
        `UPDATE JCWDOL00804.order SET ?
                WHERE id=${req.params.id}`,
        {
          status: "Menunggu Pembayaran",
          payment_img: null,
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
            message: "Payment Receipt Refused",
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  sendOrder: (req, res) => {
    try {
      db.query(
        `UPDATE JCWDOL00804.order SET ?
                WHERE id=${req.params.id}`,
        {
          status: "Dikirim",
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
            message: `Order status has changed
                        into "Dikirim"`,
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  cancelOrder: (req, res) => {
    try {
      db.query(
        `UPDATE JCWDOL00804.order SET ?
                WHERE id=${req.params.id}`,
        {
          status: "Dibatalkan",
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
            message: `Order has been canceled`,
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  completeOrder: (req, res) => {
    try {
      db.query(
        `UPDATE JCWDOL00804.order SET ?
                WHERE id=${req.params.id}`,
        {
          status: "Selesai",
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
            message: `Order completed`,
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
