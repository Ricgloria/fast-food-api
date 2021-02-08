const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');


function transformUser(users) {
    return users.map(user => {
        return {
            id_user: user.id_user,
            cpf: user.cpf,
            name: user.name,
            permission: user.permission,
            phone: user.phone,
            address: user.address,
            status: user.status
        }
    });
}

function getUser(result) {
    return {
        id_user: result[0].id_user,
        cpf: result[0].cpf,
        name: result[0].name,
        permission: result[0].permission,
        phone: result[0].phone,
        address: result[0].address,
        status: result[0].status
    };
}

router.get('/', (req, res, next) => {

    mysql.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err)
        }
        conn.query(
            'SELECT * FROM users',
            (error, result, field) => {

                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                const users = transformUser(result);

                res.status(200).send(users);
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
             FROM users
             WHERE id_user = ?`,
            [id],
            (error, result, field) => {
                conn.release();

                if (error) {
                    return res.status(500).send(error);
                }

                if (!result.length) {
                    return res.status(404).send('Não encontrado')
                }

                const user = getUser(result);
                res.status(200).json(user);
            }
        );
    });

});

router.post('/', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }

        bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
            if (errBcrypt) {
                return res.status(500).send(errBcrypt);
            }
            connection.query(
                `INSERT INTO users (cpf, name, permission, password, phone, address, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.body.cpf,
                    req.body.name,
                    req.body.permission,
                    hash,
                    req.body.phone,
                    req.body.address,
                    req.body.status
                ],
                (error, result, fields) => {
                    connection.release();
                    if (error) {
                        return res.status(500).send(error);
                    }
                    res.status(201).json({message: 'Usuário criado com sucesso'});
                }
            );
        })
    });
});

router.post('/login', (req, res, next) => {
    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }
        const query = 'SELECT * FROM users WHERE cpf = ?'
        connection.query(query, [req.body.cpf], (error, result, fields) => {
            connection.release();
            if (error) {
                return res.status(500).send(err);
            }
            if (!result.length || result[0].status === 0) {
                return res.status(401).send({message: 'Falha na autenticação'});
            }

            bcrypt.compare(req.body.password, result[0].password, (err2, result1) => {
                if (result1) {
                    const token = jwt.sign(
                        {
                            id_user: result[0].id_user,
                            permission: result[0].permission
                        }, process.env.JWT_KEY,
                        {
                            expiresIn: '2 days'
                        });

                    return res.status(200).send({
                        user: getUser(result),
                        token
                    })
                } else {
                    return res.status(401).send({message: 'Falha na autenticação'});
                }
            });
        });
    });
});

router.put('/:id', (req, res, next) => {

    mysql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err)
        }

        connection.query(
            `UPDATE users
             SET cpf        = ?,
                 name       = ?,
                 permission = ?,
                 phone      = ?,
                 address    = ?,
                 status     = ?
             WHERE id_user = ?`,
            [
                req.body.cpf,
                req.body.name,
                req.body.permission,
                req.body.phone,
                req.body.address,
                req.body.status,
                req.params.id
            ],
            (error, result, fields) => {
                connection.release();
                if (error) {
                    return res.status(500).send(error);
                }
                res.status(201).json({message: 'Usuário editado com sucesso'});
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
             FROM users
             WHERE id_user = ?`,
            [id],
            (error, result, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send(error);
                }

                res.status(202).send({
                    message: 'Usuário excluído com sucesso'
                });
            }
        );
    });
});

module.exports = router;
