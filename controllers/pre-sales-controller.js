const mysql = require('../mysql');

function transformPreSales(sales) {
    return sales.map(sale => {
        return {
            id_sale: sale.id_sale,
            sale_date: sale.sale_date,
            id_payment_method: sale.id_payment_method,
            sales_type_id: sale.sales_type_id,
            phone: sale.phone,
            delivery_address: sale.delivery_address,
            note: sale.note,
            products: JSON.parse(sale.products),
            is_finished: sale.is_finished,
            id_chat_phone: sale.id_chat_phone
        }
    })
}

function getPreSale(sales) {
    return {
        id_sale: sales[0].id_sale,
        sale_date: sales[0].sale_date,
        id_payment_method: sales[0].id_payment_method,
        sales_type_id: sales[0].sales_type_id,
        phone: sales[0].phone,
        delivery_address: sales[0].delivery_address,
        note: sales[0].note,
        products: JSON.parse(sales[0].products),
        is_finished: sales[0].is_finished,
        id_chat_phone: sales[0].id_chat_phone
    }
}

exports.getAllPreSales = async (req, res) => {
    try {
        const query = 'SELECT * FROM pre_sales';
        const result = await mysql.executeQuery(query);
        const preSales = transformPreSales(result);
        res.status(200).send(preSales);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getPreSaleById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'SELECT * FROM pre_sales WHERE id_sale = ?';
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const preSale = getPreSale(result);
            res.status(200).send(preSale);
        }
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getActivePreSaleById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'SELECT * FROM pre_sales WHERE id_sale = ? AND is_finished = 0';
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const preSale = getPreSale(result);
            res.status(200).send(preSale);
        }
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.postPreSale = async (req, res) => {
    const obj = {
        sale_date: new Date(),
        id_payment_method: req.body.id_payment_method,
        sales_type_id: req.body.sales_type_id,
        phone: req.body.phone,
        delivery_address: req.body.delivery_address,
        note: req.body.note,
        products: JSON.stringify(req.body.products),
        id_chat_phone: req.body.id_chat_phone
    }

    try {
        const query = `INSERT INTO pre_sales (sale_date, id_payment_method, sales_type_id, phone, delivery_address, note, products, id_chat_phone)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await mysql.executeQuery(query,
            [
                obj.sale_date,
                obj.id_payment_method,
                obj.sales_type_id,
                obj.phone,
                obj.delivery_address,
                obj.note,
                obj.products,
                obj.id_chat_phone
            ]);
        return res.status(201).send({preSaleID: result.insertId});
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.patchPreSales = async (req, res) => {
    try {
        const id = req.params.id
        const query = `UPDATE pre_sales SET is_finished = ? WHERE id_sale = ?`;
        await mysql.executeQuery(query, [1, id]);

        res.status(201).send({message: 'Pré venda finalizada com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}
