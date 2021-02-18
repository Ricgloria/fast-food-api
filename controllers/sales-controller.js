const mysql = require('../mysql').pool;

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

exports.postSale = (req, res, next) => {

    const obj = {
        id_payment_method: req.body.id_payment_method,
        sale_value: req.body.sale_value,
        sale_date: new Date().toLocaleString(),
        id_user: req.body.id_user
    }

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }

        const query = `INSERT INTO sales (sale_date, sale_value, id_user, id_payment_method)
                       VALUES (?, ?, ?, ?)`;
        conn.query(query, [obj.sale_date, obj.sale_value, obj.id_user, obj.id_payment_method],
            (err1, result, fields) => {
                if (err1) {
                    return res.status(500).send(err);
                } else {

                    const products = req.body.send_products.map(prod => {
                        return [
                            prod.amount,
                            result.insertId,
                            prod.id_product
                        ]
                    });

                    const query2 = `INSERT INTO sales_items (amount, id_sale, id_product)
                                    VALUES ?`;

                    conn.query(query2, [products], (err2, result1, fields1) => {
                        if (err2) {
                            return res.status(500).send(err2);
                        } else {
                            return res.status(201).send({message: 'Venda realizada com sucesso'});
                        }
                    })
                }
            })
    });
}

exports.getAllSales = (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            `SELECT sa.id_sale, sa.sale_date, sa.sale_value, u.name, pm.description
             FROM sales sa
                      INNER JOIN users u on u.id_user = sa.id_user
                      INNER JOIN payment_methods pm on sa.id_payment_method = pm.id_payment_method
             ORDER BY sa.sale_date DESC`,
            (error, result, field) => {

                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                const sales = transformSale(result);

                res.status(200).send(sales);
            }
        );
    });
}
