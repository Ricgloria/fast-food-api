const mysql = require('../mysql').pool;

function transformProducts(products) {
    return products.map(pro => {
        return {
            id_product: pro.id_product,
            product_name: pro.product_name,
            product_value: Number(pro.product_value),
            status: pro.status
        }
    });
}

function getProduct(result) {
    return {
        id_product: result[0].id_product,
        product_name: result[0].product_name,
        product_value: Number(result[0].product_value),
        status: result[0].status
    };
}

exports.getProducts = (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            'SELECT * FROM products',
            (error, result, field) => {

                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                const products = transformProducts(result);

                res.status(200).send(products);
            }
        );
    });
}

exports.getProductsForSales = (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            'SELECT * FROM products WHERE status = 1 ORDER BY product_name',
            (error, result, field) => {

                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                const products = transformProducts(result);

                res.status(200).send(products);
            }
        );
    });
}

exports.getProductById = (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            `SELECT *
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send(error);
                }

                if (!result.length) {
                    return res.status(404).send('Não encontrado')
                }

                const product = getProduct(result);
                res.status(200).json(product);
            }
        );
    });
}

exports.postProduct = (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }

        connection.query(
            `INSERT INTO products (product_name, product_value, status)
             VALUES (?, ?, ?)`,
            [req.body.product_name, req.body.product_value, req.body.status],
            (error, result, fields) => {

                if (error) {
                    connection.release();
                    return res.status(500).send(error);
                }
                connection.query(
                    `SELECT *
                     FROM products
                     WHERE id_product = ?`,
                    [result.insertId],
                    (error, result, field) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send(error);
                        }

                        if (!result.length) {
                            return res.status(404).send('Não encontrado')
                        }

                        const product = getProduct(result);
                        res.status(201).json(product);
                    }
                );
            }
        );
    });
}

exports.putProduct = (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }
        connection.query(
            `UPDATE products
             SET product_name  = ?,
                 product_value = ?,
                 status        = ?
             WHERE id_product = ?`,
            [req.body.product_name, req.body.product_value, req.body.status, req.params.id],
            (error, result, fields) => {

                if (error) {
                    connection.release();
                    return res.status(500).send(error);
                }

                connection.query(
                    `SELECT *
                     FROM products
                     WHERE id_product = ?`,
                    [req.params.id],
                    (error, result, field) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send(error);
                        }

                        if (!result.length) {
                            return res.status(404).send('Não encontrado')
                        }

                        const product = getProduct(result);
                        res.status(201).json(product);
                    }
                );
            }
        );
    });
}

exports.deleteProduct = (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            `DELETE
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                res.status(202).send({
                    message: 'Produto excluído com sucesso'
                });
            }
        );
    });
}
