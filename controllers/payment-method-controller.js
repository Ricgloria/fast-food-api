const mysql = require('../mysql');

function transformPaymentMethod(method) {
    return method.map(pro => {
        return {
            id_payment_method: pro.id_payment_method,
            description: pro.description,
            status: pro.status
        }
    });
}

function getPaymentMethod(result) {
    return {
        id_payment_method: result[0].id_payment_method,
        description: result[0].description,
        status: result[0].status
    };
}


exports.getPaymentMethod = async (req, res) => {
    try {
        const query = 'SELECT * FROM payment_methods';
        const result = await mysql.executeQuery(query);
        const products = transformPaymentMethod(result);
        res.status(200).send(products);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getPaymentMethodForSales = async (req, res) => {
    try {
        const query = 'SELECT * FROM payment_methods WHERE status = 1 ORDER BY description';
        const result = await mysql.executeQuery(query);
        const products = transformPaymentMethod(result);
        res.status(200).send(products);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getPaymentMethodById = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `SELECT *
                       FROM payment_methods
                       WHERE id_payment_method = ?`;
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const product = getPaymentMethod(result);
            res.status(200).json(product);
        }
    } catch (e) {
        return res.status(500).send(e);
    }

}

exports.postPaymentMethod = async (req, res) => {

    try {
        const query = `INSERT INTO payment_methods (description, status)
                       VALUES (?, ?)`;
        const result = await mysql.executeQuery(query, [req.body.description, req.body.status]);

        const query2 = `SELECT *
                        FROM payment_methods
                        WHERE id_payment_method = ?`
        const result2 = await mysql.executeQuery(query2, [result.insertId]);
        const product = getPaymentMethod(result2);
        res.status(201).json(product);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putPaymentMethod = async (req, res) => {

    try {
        const query = `UPDATE payment_methods
                       SET description = ?,
                           status      = ?
                       WHERE id_payment_method = ?`;
        await mysql.executeQuery(query, [req.body.description, req.body.status, req.params.id]);
        const result = await mysql.executeQuery(
            `SELECT *
             FROM payment_methods
             WHERE id_payment_method = ?`, [req.params.id]);
        const product = getPaymentMethod(result);
        res.status(201).json(product);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.deletePaymentMethod = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `DELETE
                       FROM payment_methods
                       WHERE id_payment_method = ?`;
        await mysql.executeQuery(query, [id]);
        res.status(202).send({
            message: 'Método de pagamento excluído com sucesso'
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}
