const multer = require("multer");
const fs = require("fs");

module.exports = {
  imgUploader: (directory, filePrefix) => {
    // Define default directory location
    let defaultDir = "./public";
    // Multer configuration
    const storageUploader = multer.diskStorage({
      destination: (req, file, cb) => {
        // Menentukan lokasi penyimpanan
        const pathDir = directory ? defaultDir + directory : defaultDir;
        // Melakukan pengecekan pathDir
        if (fs.existsSync(pathDir)) {
          // Jika directory ada, maka multer akan menjalankan cb untuk menyimpan file
          console.log(`Directory ${pathDir} exist`);
          cb(null, pathDir);
        } else {
          // Jika directory tidak ada
          fs.mkdirSync(pathDir, { recursive: true }, (err) => {
            if (err) {
              console.log(`Error making directory`, err);
            }
            cb(err, pathDir);
          });
        }
      },
      filename: (req, file, cb) => {
        // Membaca extension
        let ext = file.originalname.split(".");
        console.log(ext);
        let newname = filePrefix + Date.now() + "." + ext[ext.length - 1];
        console.log("New filename", newname);
        cb(null, newname);
      },
    });
    return multer({
      storage: storageUploader,
      fileFilter: (req, file, cb) => {
        const extFilter = /\.(gif|jpe?g|png|webp|bmp|avif)/;
        let check = file.originalname.toLowerCase().match(extFilter);
        if (check) {
          cb(null, true);
        } else {
          cb(new Error(`Your file extension denied ❌`), false);
        }
      },
      limits: {
        fileSize: 1048576,
      },
    });
  },
  paymentImgUploader: (directory, filePrefix) => {
    let defaultDir = "./public";
    const storageUploader = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = directory ? defaultDir + directory : defaultDir;
        if (fs.existsSync(pathDir)) {
          console.log(`Directory ${pathDir} exist`);
          cb(null, pathDir);
        } else {
          fs.mkdirSync(pathDir, { recursive: true }, (err) => {
            if (err) {
              console.log(`Error making directory`, err);
            }
            cb(err, pathDir);
          });
        }
      },
      filename: (req, file, cb) => {
        let ext = file.originalname.split(".");
        console.log(ext);
        let newname = filePrefix + Date.now() + "." + ext[ext.length - 1];
        console.log("New filename", newname);
        cb(null, newname);
      },
    });
    return multer({
      storage: storageUploader,
      fileFilter: (req, file, cb) => {
        const extFilter = /\.(jpe?g|png|avif)/;
        let check = file.originalname.toLowerCase().match(extFilter);
        if (check) {
          cb(null, true);
        } else {
          cb(new Error(`Your file extension denied ❌`), false);
        }
      },
      limits: {
        fileSize: 1048576,
      },
    });
  },
  categoryImgUploader: (directory, filePrefix) => {
    let defaultDir = "./public";
    const storageUploader = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = directory ? defaultDir + directory : defaultDir;
        if (fs.existsSync(pathDir)) {
          console.log(`Directory ${pathDir} exist`);
          cb(null, pathDir);
        } else {
          fs.mkdirSync(pathDir, { recursive: true }, (err) => {
            if (err) {
              console.log(`Error making directory`, err);
            }
            cb(err, pathDir);
          });
        }
      },
      filename: (req, file, cb) => {
        let ext = file.originalname.split(".");
        console.log(ext);
        let newname = filePrefix + Date.now() + "." + ext[ext.length - 1];
        console.log("New filename", newname);
        cb(null, newname);
      },
    });
    return multer({
      storage: storageUploader,
      fileFilter: (req, file, cb) => {
        const extFilter = /\.(jpe?g|png|avif)/;
        let check = file.originalname.toLowerCase().match(extFilter);
        if (check) {
          cb(null, true);
        } else {
          cb(new Error(`Your file extension denied ❌`), false);
        }
      },
      limits: {
        fileSize: 1048576,
      },
    });
  },
};
