const mysql = require('../mysql');

function transformDeliveryman(method) {
    return method.map(pro => {
        return {
            id_deliveryman: pro.id_deliveryman,
            name: pro.name,
            phone: pro.phone,
            motorcycle: pro.motorcycle,
            status: pro.status
        }
    });
}

function generateDeliveryman(result) {
    return {
        id_deliveryman: result[0].id_deliveryman,
        name: result[0].name,
        phone: result[0].phone,
        motorcycle: result[0].motorcycle,
        status: result[0].status
    };
}

exports.getDeliveryman = async (req, res) => {
    try {
        const query = 'SELECT * FROM deliveryman';
        const result = await mysql.executeQuery(query);
        const deliveryman = transformDeliveryman(result);
        res.status(200).send(deliveryman);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getDeliverymanForSales = async (req, res) => {
    try {
        const query = 'SELECT * FROM deliveryman WHERE status = 1 ORDER BY name';
        const result = await mysql.executeQuery(query);
        const deliveryman = transformDeliveryman(result);
        res.status(200).send(deliveryman);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getDeliverymanById = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `SELECT *
                       FROM deliveryman
                       WHERE id_deliveryman = ?`;
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const deliveryman = generateDeliveryman(result);
            res.status(200).json(deliveryman);
        }
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.postDeliveryman = async (req, res) => {

    try {
        const query = `INSERT INTO deliveryman (name, phone, motorcycle, status)
                       VALUES (?, ?, ?, ?)`;
        const result = await mysql.executeQuery(query, [req.body.name, req.body.phone, req.body.motorcycle, req.body.status]);

        const query2 = `SELECT *
                        FROM deliveryman
                        WHERE id_deliveryman = ?`
        const result2 = await mysql.executeQuery(query2, [result.insertId]);
        const deliveryman = generateDeliveryman(result2);
        res.status(201).json(deliveryman);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putDeliveryman = async (req, res) => {

    try {
        const query = `UPDATE deliveryman
                       SET name       = ?,
                           phone      = ?,
                           motorcycle = ?,
                           status     = ?
                       WHERE id_deliveryman = ?`;
        await mysql.executeQuery(query, [req.body.name, req.body.phone, req.body.motorcycle, req.body.status, req.params.id]);
        const result = await mysql.executeQuery(
            `SELECT *
             FROM deliveryman
             WHERE id_deliveryman = ?`, [req.params.id]);
        const deliveryman = generateDeliveryman(result);
        res.status(201).json(deliveryman);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.deleteDeliveryman = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `DELETE
                       FROM deliveryman
                       WHERE id_deliveryman = ?`;
        await mysql.executeQuery(query, [id]);
        res.status(202).send({
            message: 'Entregador excluído com sucesso'
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}
