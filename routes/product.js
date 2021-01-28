const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res, next) => {

    mysql.getConnection((err, conn) => {
        conn.query(
            'SELECT * FROM products',
            (error, result, field) => {
                conn.release();
                if (err) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(200).send(result);
            }
        );
    });
});

router.get('/:id', (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        conn.query(
            `SELECT *
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (err) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                if (!result.length) {
                    return res.status(404).send({error: 'Não encontrado'})
                }
                const product = result[0];
                res.status(200).send(product);
            }
        );
    });
});

router.post('/', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        connection.query(
            `INSERT INTO products (product_name, product_value, status)
             VALUES (?, ?, ?)`,
            [req.body.product_name, req.body.product_value, req.body.status],
            (error, result, fields) => {
                connection.release();
                if (err) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(201).send({
                    id_product: result.insertId, ...req.body
                });
            }
        );
    });
});

router.put('/:id', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        connection.query(
            `UPDATE products
             SET product_name  = ?,
                 product_value = ?,
                 status        = ?
             WHERE id_product = ?`,
            [req.body.product_name, req.body.product_value, req.body.status, req.params.id],
            (error, result, fields) => {
                connection.release();
                if (err) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }
                res.status(201).send({
                    id_product: req.params.id, ...req.body
                });
            }
        );
    });
});

router.delete('/:id', (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        conn.query(
            `DELETE
             FROM products
             WHERE id_product = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (err) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    });
                }

                res.status(204);
            }
        );
    });
});


module.exports = router;
