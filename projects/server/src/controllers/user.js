const { db, dbQuery } = require("../config/db");
const { hashPass } = require("../config/encrypt");
const { transporter } = require("../config/transporter");
const { createToken } = require("../config/token");
const bcrypt = require("bcrypt");

module.exports = {
  signUp: async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      const newPass = await hashPass(password);
      const checkEmail = await dbQuery(
        `SELECT email from user WHERE email=${db.escape(email)}`
      );
      if (checkEmail.length) {
        return res.status(409).send({
          success: false,
          message: "Email already exist, please use another Email",
        });
      } else {
        console.log(name);
        db.query(
          "INSERT INTO user SET ?",
          { name, email, phone, password: newPass ,role_id : 1},
          (error, results, fields) => {
            if (error) throw error;
            db.query(
              `SELECT * from user WHERE email=${db.escape(email)}`,
              (error, results) => {
                const token = createToken({ ...results[0] });
                transporter.sendMail(
                  {
                    from: "XMART ADMIN",
                    to: email,
                    subject: "Verify Account",
                    html: `<div>
                <h3>
                Click link below to Verify your account
                </h3>
                <a href="http://localhost:3000/verify-email?t=${token}">
                Verify now
                </a>
                </div>`,
                  },
                  (error, info) => {
                    if (error) {
                      return res.status(400).send(error);
                    }
                    return res.status(200).send({
                      success: true,
                      message:
                        "Sign up success ✅, please check your email for account verification",
                      info,
                    });
                  }
                );
              }
            );
          }
        );
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // ============
  // Verify Email
  verifyEmail: async (req, res) => {
    try {
      db.query(
        `SELECT * FROM user WHERE email=${db.escape(req.decript.email)};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          } else if (results[0].is_verified === 1) {
            return res.status(402).send({
              message: `'${db.escape(
                req.decript.email
              )}'
              is already verified`,
            });
          } else {
            db.query(
              `UPDATE user SET is_verified = 1 WHERE email=${db.escape(
                req.decript.email
              )}`,
              (error, results) => {
                if (error) {
                  return res.status(500).send({
                    success: false,
                    message: error,
                  });
                }
                return res.status(201).send({
                  message: `'${db.escape(
                    req.decript.email
                  )}'
                  has been successfully verified!`,
                });
              }
            );
          }
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // ==============================
  // Email check for Reset Password
  forgotPass: async (req, res) => {
    try {
      const { email } = req.body;
      db.query(
        `SELECT * from user WHERE email=${db.escape(email)};`,
        (error, results) => {
          if (!results.length) {
            return res.status(409).send({
              success: false,
              message:
                "Email address is not Registered, Please enter a Registered Email",
            });
          } else {
            const token = createToken({ ...results[0] });
            transporter.sendMail(
              {
                from: "XMART ADMIN",
                to: email,
                subject: "Reset password",
                html: `<div>
              <h3>
              Click link below to Reset your password
              </h3>
              <a href="http://localhost:3000/reset-password?t=${token}">
              Reset now
              </a>
              </div>`,
              },
              (error, info) => {
                if (error) {
                  return res.status(400).send(error);
                }
                return res.status(200).send({
                  success: true,
                  message: "Check your email to reset your password",
                  info,
                });
              }
            );
          }
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // ===================
  // Update new password
  resetPass: async (req, res) => {
    try {
      const { password } = req.body;
      const newPass = await hashPass(password);
      db.query(
        `UPDATE user set password=${db.escape(newPass)} 
      WHERE id=${db.escape(req.decript.id)};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          return res.status(200).send({
            success: true,
            message: "Reset Password success",
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // =======
  // Sign in
  signIn: async (req, res) => {
    try {
      db.query(
        `SELECT user.*, branch.name AS branch_name from user LEFT JOIN branch ON branch.id = user.branch_id
      WHERE user.email=${db.escape(req.body.email)};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          if (!results.length) {
            return res.status(404).send({
              success: false,
              message:
                "This email is not registered, please input the correct email",
            });
          }
          const passCheck = bcrypt.compareSync(
            req.body.password,
            results[0].password
          );
          delete results[0].password;
          if (passCheck) {
            const token = createToken({ ...results[0] });
            return res.status(200).send({ ...results[0], token });
          } else {
            return res.status(401).send({
              success: false,
              message: "Your password is wrong",
            });
          }
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // ==========
  // Keep login
  keepLogin: async (req, res) => {
    try {
      db.query(
        `SELECT user.*, branch.name AS branch_name from user LEFT JOIN branch ON branch.id = user.branch_id
      WHERE user.id=${db.escape(req.decript.id)};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          const token = createToken({ ...results[0] });
          return res.status(200).send({ ...results[0], token });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  editProfile: (req, res) => {
    const { name, email, birthdate, gender } = req.body;
    if (email === req.decript.email) {
      db.query(
        `UPDATE user SET ? WHERE id=${req.decript.id}`,
        { name, birthdate, gender },
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          return res.status(200).send({
            success: true,
            message: "Successfully updated personal data",
          });
        }
      );
    } else {
      db.query(
        `SELECT email from user WHERE email=${db.escape(email)}`,
        (error, checkEmail) => {
          if (error) throw error;
          if (checkEmail.length) {
            return res.status(409).send({
              success: false,
              message: "Email already exist, please use another Email",
            });
          }
          db.query(
            'UPDATE user SET name=?, email=?, birthdate=?, gender=?, is_verified=? WHERE id=?',
            [name, email, birthdate, gender, 0, req.decript.id],
            (error, results) => {
              db.query(
                `SELECT * from user WHERE email=${db.escape(email)}`,
                (error, results) => {
                  const token = createToken({ ...results[0] });
                  transporter.sendMail(
                    {
                      from: "XMART ADMIN",
                      to: email,
                      subject: "Verify Account",
                      html: `<div>
                  <h3>
                  Click link below to Verify your account
                  </h3>
                  <a href="http://localhost:3000/verify-email?t=${token}">
                  Verify now
                  </a>
                  </div>`,
                    },
                    (error, info) => {
                      if (error) {
                        return res.status(500).send({
                          success: false,
                          message: error,
                        });
                      }
                      return res.status(200).send({
                        success: true,
                        message: `Successfully updated personal data
                        Please check your email
                        to verify your new email`,
                        info,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  },
  // Untuk validasi front end cek email sudah pernah dipakai
  uniqueEmail: (req, res) => {
    db.query(
      `SELECT email from user WHERE email=${db.escape(req.params.email)}`,
      (error, results) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: error,
          });
        }
        if (results.length) {
          return res.status(409).send({
            success: false,
            message: "Email already in use. please use another email",
          });
        }
        return res.status(200).send({
          success: true,
        });
      }
    );
  },
  uploadProfileImg: (req, res) => {
    db.query(
      `UPDATE user SET ? WHERE id=${req.decript.id}`,
      { profile_img: `/imgProfile/${req.files[0].filename}` },
      (error, results) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: error,
          });
        }
        return res.status(200).send({
          success: true,
          message: "Profile image uploaded",
        });
      }
    );
  },
  getUserInfo: (req, res) => {
    db.query(
      `SELECT * from user WHERE id=${req.decript.id}`,
      (error, results) => {
        if (error) {
          return res.status(500).send({
            success: false,
            message: error,
          });
        }
        return res.status(200).send({ ...results[0], success: true });
      }
    );
  },
  // ===============
  // Change password
  changePass: async (req, res) => {
    try {
      const { oldpassword, password } = req.body;
      const passCheck = bcrypt.compareSync(oldpassword, req.decript.password);
      if (oldpassword === password) {
        return res.status(406).send({
          success: false,
          message: `Your new password
          must be different from old`,
        })
      }
      if (!passCheck) {
        return res.status(406).send({
          success: false,
          message: "Your old password is wrong",
        });
      } else {
        const newPass = await hashPass(password);
        db.query(
          `UPDATE user set password=${db.escape(newPass)}
          WHERE id=${db.escape(req.decript.id)};`,
          (error, results) => {
            if (error) {
              return res.status(500).send({
                success: false,
                message: error,
              });
            }
            return res.status(200).send({
              success: true,
              message: "Change Password success",
            });
          }
        );
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  getBranchAdmin: async (req, res) => {
    try {
      const { order_by, page, name, branch } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit
      db.query(
        `SELECT u.id, u.name, u.phone, u.email, r.role_name AS role_id, b.name AS branch_id  
        FROM user u
        JOIN role r ON u.role_id = r.id
        JOIN branch b ON u.branch_id = b.id
        WHERE role_id=2
        AND u.name LIKE '%${name}%'
        AND b.name LIKE '%${branch}%'
        ORDER BY ${order_by} ASC
        LIMIT ${limit} OFFSET ${offset};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          };
          return res.status(200).send({
            success: true,
            data: results, limit,
          });
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    };
  },
  addBranchAdmin: async (req, res) => {
    try {
      const { name, phone, email, password, branch_id } = req.body;
      const newPass = await hashPass(password);
      const checkEmail = await dbQuery(
        `SELECT email from user WHERE email=${db.escape(email)}`
      );
      if (checkEmail.length) {
        return res.status(409).send({
          success: false,
          message: "Email is already used",
        });
      } else {
        db.query(
          "INSERT INTO user SET ?",
          { name, phone, email, password: newPass, branch_id, role_id: 2 },
          (error, results, fields) => {
            if (error) {
              return res.status(500).send({
                success: false,
                message:
                  "Add Branch Admin Failed, Please fill the empty fields"
              });
            };
            return res.status(200).send({
              success: true,
              message:
                "Add Branch Admin Success"
            });
          });
      };
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
