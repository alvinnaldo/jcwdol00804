const { db, dbQuery } = require("../config/db");

module.exports = {
  // Get Data From API Raja Ongkir
  addCitiesData: async (req, res) => {
    try {
      const checkData = await dbQuery("SELECT MAX(id) FROM cities_data");
      if (checkData.length) {
        return res.status(403).send({message : "Data already exist"});
      }
      const data = [];
      const urlProvince = "https://rajaongkir.komerce.id/api/v1/destination/province";
      const options = { method: 'GET', headers: { accept: 'application/json', key: process.env.RAJAONGKIR_KEY } };
      // fetch province data
      const province = await fetch(urlProvince, options);
      const listProvince = await province.json();
      // fetch city data for each province
      for (const val1 of listProvince.data) {
        let urlCity = `https://rajaongkir.komerce.id/api/v1/destination/city/${val1.id}`
        let city = await fetch(urlCity, options);
        let listCity = await city.json();
        // combine city and province data into array
        for (let val2 of listCity.data) {
          data.push([val2.id, val2.name, val1.name])
        }
      }
      // insert into db
      db.query(
        `INSERT INTO cities_data (city_id ,name, province) VALUES ?`,
        [data],
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          } else {
            return res.status(200).send(results);
          }
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // GET Province
  getProvince: async (req, res) => {
    try {
      db.query(
        `SELECT province FROM cities_data 
                GROUP BY province 
                ORDER BY province ASC;`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          return res.status(200).send(results);
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // GET City
  getCities: async (req, res) => {
    try {
      const { province } = req.body;
      db.query(
        `SELECT name FROM cities_data 
                WHERE province=${db.escape(province)};`,
        (error, results) => {
          if (error) {
            return res.status(500).send({
              success: false,
              message: error,
            });
          }
          return res.status(200).send(results);
        }
      );
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
