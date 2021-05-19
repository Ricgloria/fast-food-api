const mysql = require('../mysql');

function getFormattedDiscount(result) {
    return {
        id_discount: result.id_discount,
        discount_rate: Number(result.discount_rate)
    };
}

exports.getDiscount = async (req, res) => {
    try {
        const query = 'SELECT * FROM discount WHERE id_discount = 1';
        const result = await mysql.executeQuery(query);
        const discount = getFormattedDiscount(result[0]);
        res.status(200).send(discount);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putDiscount = async (req, res) => {
    try {
        let query = `UPDATE discount
                     SET discount_rate = ?
                     WHERE id_discount = 1`;
        await mysql.executeQuery(query, [req.body.discount_rate])

        query = 'SELECT * FROM discount WHERE id_discount = 1';
        const result = await mysql.executeQuery(query);
        const discount = getFormattedDiscount(result[0]);

        query = `UPDATE products pro1 JOIN products pro2 ON pro1.id_product = pro2.id_product
                 SET pro1.product_discount_value = pro2.product_value - (pro2.product_value * ${discount.discount_rate} / 100)`;
        await mysql.executeQuery(query);

        res.status(200).send(discount);
    } catch (e) {
        return res.status(500).send(e);
    }
}
