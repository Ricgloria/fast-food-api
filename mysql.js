const mysql = require('mysql2');

const pool = mysql.createPool({
    "connectionLimit": 100,
    "user": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASSWORD,
    "database": process.env.MYSQL_DATABASE,
    "host": process.env.MYSQL_HOST,
    "port": process.env.MYSQL_PORT
});

exports.executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
            if (!err) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
}

exports.pool = pool;
