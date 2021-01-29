const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send(err)}
        conn.query(
            'SELECT * FROM products',
            (error, result, field) => {
                conn.release();

                if (error) {return res.status(500).send(error);}
                const products = result.map(pro => {
                    return {
                        id_product: pro.id_product,
                        product_name: pro.product_name,
                        product_value: Number(pro.product_value),
                        status: pro.status
                    }
                });

                res.status(200).send(products);
            }
        );
    });
});

router.get('/:id', (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send(err)}
        conn.query(
            `SELECT *
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();

                if (error) {return res.status(500).send(error);}

                if (!result.length) {return res.status(404).send('Não encontrado')}

                const product = {
                    id_product: result[0].id_product,
                    product_name: result[0].product_name,
                    product_value: Number(result[0].product_value),
                    status: result[0].status
                };
                res.status(200).json(product);
            }
        );
    });
});

router.post('/', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if(err) { return res.status(500).send(err)}
        connection.query(
            `INSERT INTO products (product_name, product_value, status)
             VALUES (?, ?, ?)`,
            [req.body.product_name, req.body.product_value, req.body.status],
            (error, result, fields) => {
                connection.release();

                if (error) {return res.status(500).send(error);}

                res.status(201).json({
                    id_product: result.insertId, ...req.body
                });
            }
        );
    });
});

router.put('/:id', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if(err) { return res.status(500).send(err)}
        connection.query(
            `UPDATE products SET product_name = ?, product_value = ?, status = ? WHERE id_product = ?`,
            [req.body.product_name, req.body.product_value, req.body.status, req.params.id],
            (error, result, fields) => {
                connection.release();

                if (error) {return res.status(500).send(error);}

                res.status(202).json({
                    id_product: Number(req.params.id), ...req.body
                });
            }
        );
    });
});

router.delete('/:id', (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send(err)}
        conn.query(
            `DELETE
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (error) {return res.status(500).send(error);}

                res.status(202).send({
                    message: 'Produto excluído com sucesso'
                });
            }
        );
    });
});

module.exports = router;
