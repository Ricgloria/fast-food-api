const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

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

router.get('/', (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            'SELECT * FROM payment_methods',
            (error, result, field) => {

                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                const products = transformPaymentMethod(result);

                res.status(200).send(products);
            }
        );
    });
});

router.get('/:id', (req, res, next) => {

    const id = req.params.id;

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            `SELECT *
             FROM payment_methods
             WHERE id_payment_method = ?`,
            [id],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send(error);
                }

                if (!result.length) {
                    return res.status(404).send('Não encontrado')
                }

                const product = getPaymentMethod(result);
                res.status(200).json(product);
            }
        );
    });

});

router.post('/', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }

        connection.query(
            `INSERT INTO payment_methods (description, status)
             VALUES (?, ?)`,
            [req.body.description, req.body.status],
            (error, result, fields) => {

                if (error) {
                    connection.release();
                    return res.status(500).send(error);
                }
                connection.query(
                    `SELECT *
                     FROM payment_methods
                     WHERE id_payment_method = ?`,
                    [result.insertId],
                    (error, result, field) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send(error);
                        }

                        if (!result.length) {
                            return res.status(404).send('Não encontrado')
                        }

                        const product = getPaymentMethod(result);
                        res.status(201).json(product);
                    }
                );
            }
        );
    });

});

router.put('/:id', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }

        connection.query(
            `UPDATE payment_methods
             SET description = ?,
                 status      = ?
             WHERE id_payment_method = ?`,
            [req.body.description, req.body.status, req.params.id],
            (error, result, fields) => {

                if (error) {
                    connection.release();
                    return res.status(500).send(error);
                }

                connection.query(
                    `SELECT *
                     FROM payment_methods
                     WHERE id_payment_method = ?`,
                    [req.params.id],
                    (error, result, field) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send(error);
                        }

                        if (!result.length) {
                            return res.status(404).send('Não encontrado')
                        }

                        const product = getPaymentMethod(result);
                        res.status(201).json(product);
                    }
                );
            }
        );
    });
});

router.delete('/:id', (req, res, next) => {

    const id = req.params.id;
    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            `DELETE
             FROM payment_methods
             WHERE id_payment_method = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                res.status(202).send({
                    message: 'Método de pagamento excluído com sucesso'
                });
            }
        );
    });
});

module.exports = router;
