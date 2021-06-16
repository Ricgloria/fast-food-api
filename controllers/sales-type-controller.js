const mysql = require('../mysql');

function transformSaleTypes(result) {
    return result.map(res => {
        return {
            sales_type_id: res.sales_type_id,
            name: res.name,
            status: res.status
        }
    })
}

function getSaleType(result) {
    return {
        sales_type_id: result[0].sales_type_id,
        name: result[0].name,
        status: result[0].status
    };
}

exports.getSaleTypes = async (req, res) => {
    try {
        const query = 'SELECT * FROM sales_type';
        const result = await mysql.executeQuery(query);
        const users = transformSaleTypes(result);
        res.status(200).send(users);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getSaleTypesForSales = async (req, res) => {
    try {
        const query = 'SELECT * FROM sales_type WHERE status = 1 ORDER BY name';
        const result = await mysql.executeQuery(query);
        const users = transformSaleTypes(result);
        res.status(200).send(users);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getSaleTypesById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `SELECT *
                       FROM sales_type
                       WHERE sales_type_id = ?`;
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const user = getSaleType(result);
            res.status(200).json(user);
        }
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putSaleType = async (req, res) => {
    try {
        const query = `UPDATE sales_type
                       SET status     = ?
                       WHERE sales_type_id = ?`;
        await mysql.executeQuery(query, [
            req.body.status,
            req.params.sales_type_id
        ]);
        res.status(201).json({message: 'Tipo de venda editado com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}

