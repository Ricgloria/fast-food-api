const mysql = require('../mysql');

function transformSale(result) {
    return result.map(res => {
        return {
            id_sale: res.id_sale,
            sale_date: res.sale_date,
            sale_value: res.sale_value,
            name: res.name,
            description: res.description
        }
    })
}

function reportMap(salesType, paymentMethods, users, deliverymen, itemsSale, total) {
    return {
        total,
        salesType,
        paymentMethods,
        users,
        deliverymen,
        itemsSale
    }
}

exports.postSale = async (req, res) => {

    const obj = {
        id_payment_method: req.body.id_payment_method,
        sale_value: req.body.sale_value,
        sale_date: new Date(),
        id_user: req.body.id_user,
        sales_type_id: req.body.sales_type_id,
        delivery_address: req.body.delivery_address,
        note: req.body.note,
        id_deliveryman: req.body.id_deliveryman
    }

    try {
        let query = `INSERT INTO sales (sale_date, sale_value, id_user, id_payment_method, sales_type_id,
                                        delivery_address, note, id_deliveryman)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await mysql.executeQuery(query,
            [
                obj.sale_date,
                obj.sale_value,
                obj.id_user,
                obj.id_payment_method,
                obj.sales_type_id,
                obj.delivery_address,
                obj.note,
                obj.id_deliveryman
            ]);

        const products = req.body.send_products.map(prod => {
            return [
                prod.amount,
                result.insertId,
                prod.id_product
            ]
        });

        query = `INSERT INTO sales_items (amount, id_sale, id_product)
                 VALUES ?`;
        await mysql.executeQuery(query, [products]);
        return res.status(201).send({message: 'Venda realizada com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getAllSales = async (req, res) => {
    try {
        const query = `SELECT sa.id_sale, sa.sale_date, sa.sale_value, u.name, pm.description
                       FROM sales sa
                                INNER JOIN users u on u.id_user = sa.id_user
                                INNER JOIN payment_methods pm on sa.id_payment_method = pm.id_payment_method
                       ORDER BY sa.sale_date DESC`;
        const result = await mysql.executeQuery(query);
        const sales = transformSale(result);
        res.status(200).send(sales);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getSalesReports = async (req, res) => {
    try {

        let query = `SELECT sl.name, COUNT(CASE WHEN sl.sales_type_id = sales.sales_type_id THEN 1 END) as total
                     FROM sales
                              JOIN sales_type sl on sl.sales_type_id = sales.sales_type_id
                     GROUP BY sl.name, sales.sales_type_id`;

        const salesType = await mysql.executeQuery(query, []);

        query = `SELECT pm.description,
                        COUNT(CASE WHEN pm.id_payment_method = sales.id_payment_method THEN 1 END) as total
                 FROM sales
                          JOIN payment_methods as pm on pm.id_payment_method = sales.id_payment_method
                 GROUP BY pm.description, sales.id_payment_method`;

        const paymentMethods = await mysql.executeQuery(query, []);

        query = `SELECT u.name, COUNT(sales.id_user) total
                 FROM sales
                          JOIN users u on sales.id_user = u.id_user
                 GROUP BY u.name`;

        const users = await mysql.executeQuery(query, []);

        query = `SELECT delivery.name, COUNT(sales.id_deliveryman) total
                 FROM sales
                          JOIN deliveryman delivery on sales.id_deliveryman = delivery.id_deliveryman
                 GROUP BY delivery.name`;

        const deliverymen = await mysql.executeQuery(query, []);

        query = `SELECT p.product_name as name, SUM(sali.amount) as total
                 FROM sales_items sali
                          join products p on p.id_product = sali.id_product
                 GROUP BY p.product_name
                 ORDER BY total DESC;`

        const itemsSale = await mysql.executeQuery(query, []);

        query = `SELECT SUM(amount) total FROM sales_items;`

        const totalItemsSale = await mysql.executeQuery(query, []);

        res.status(200).send(reportMap(salesType, paymentMethods, users, deliverymen, itemsSale, totalItemsSale));
    } catch (e) {
        return res.status(500).send(e);
    }
}
