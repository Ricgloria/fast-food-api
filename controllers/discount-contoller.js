const mysql = require('../mysql');

exports.getDiscount = async (req, res) => {
    try {
        const query = 'SELECT * FROM discount WHERE id_discount = 1';
        const result = await mysql.executeQuery(query);
        const discount = result[0];
        res.status(200).send(discount);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putDiscount = async (req, res) => {
    try {
        const query = `UPDATE discount SET discount_rate = ? WHERE id_discount = 1`;
        await mysql.executeQuery(query, [req.body.discount_rate])
        const queryResult = 'SELECT * FROM discount WHERE id_discount = 1';
        const result = await mysql.executeQuery(queryResult);
        const discount = result[0];
        res.status(200).send(discount);
    } catch (e) {
        return res.status(500).send(e);
    }
}
