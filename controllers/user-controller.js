const bcrypt = require('bcrypt');
const mysql = require('../mysql');
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

exports.getUsers = async (req, res) => {

    try {
        const query = 'SELECT * FROM users';
        const result = await mysql.executeQuery(query);
        const users = transformUser(result);
        res.status(200).send(users);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getUsersById = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `SELECT *
                       FROM users
                       WHERE id_user = ?`;
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send({message: 'Não encontrado'})
        } else {
            const user = getUser(result);
            res.status(200).json(user);
        }
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.postUser = async (req, res) => {
    try {
        const query = 'SELECT * FROM users WHERE cpf = ?'
        let result = await mysql.executeQuery(query, [req.body.cpf]);
        if (result.length) {
            return res.status(401).send({message: 'Usuário já existente'});
        }

        bcrypt.hash(req.body.password, 10, async (errBcrypt, hash) => {
            if (errBcrypt) {
                return res.status(500).send(errBcrypt);
            }
            try {
                const query = `INSERT INTO users (cpf, name, permission, password, phone, address, status)
                               VALUES (?, ?, ?, ?, ?, ?, ?)`;
                await mysql.executeQuery(query, [
                    req.body.cpf,
                    req.body.name,
                    req.body.permission,
                    hash,
                    req.body.phone,
                    req.body.address,
                    req.body.status
                ]);
                res.status(201).json({message: 'Usuário criado com sucesso'});
            } catch (e) {
                return res.status(500).send(e);
            }
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putUser = async (req, res) => {

    try {
        const query = `UPDATE users
                       SET cpf        = ?,
                           name       = ?,
                           permission = ?,
                           phone      = ?,
                           address    = ?,
                           status     = ?
                       WHERE id_user = ?`;
        await mysql.executeQuery(query, [
            req.body.cpf,
            req.body.name,
            req.body.permission,
            req.body.phone,
            req.body.address,
            req.body.status,
            req.params.id
        ]);
        res.status(201).json({message: 'Usuário editado com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `DELETE
                       FROM users
                       WHERE id_user = ?`;
        await mysql.executeQuery(query, [id]);
        res.status(202).send({
            message: 'Usuário excluído com sucesso'
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.resetPassword = async (req, res) => {
    try {

        bcrypt.hash('123456', 10, async (errBcrypt, hash) => {
            if (errBcrypt) {
                return res.status(500).send(errBcrypt);
            }
            try {
                const query = `UPDATE users set password = ? WHERE id_user = ?`;
                await mysql.executeQuery(query, [
                    hash,
                    req.params.id
                ]);
                res.status(201).json({message: 'Senha resetada com sucesso'});
            } catch (e) {
                return res.status(500).send(e);
            }
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.renewPassword = async (req, res) => {
    try {
        const query = 'SELECT * FROM users WHERE id_user = ?'
        let result = await mysql.executeQuery(query, [req.body.id_user]);

        if (!result.length || result[0].status === 0) {
            return res.status(401).send({message: 'Falha na troca de senha'});
        }

        bcrypt.compare(req.body.oldPassword, result[0].password, (err2, result1) => {
            if (result1) {
                bcrypt.hash(req.body.newPassword, 10, async (errBcrypt, hash) => {
                    if (errBcrypt) {
                        return res.status(500).send(errBcrypt);
                    }
                    try {
                        const query = `UPDATE users set password = ? WHERE id_user = ?`;
                        await mysql.executeQuery(query, [
                            hash,
                            req.body.id_user
                        ]);
                        res.status(201).json({message: 'Senha atualizada com sucesso'});
                    } catch (e) {
                        return res.status(500).send(e);
                    }
                });
            } else {
                return res.status(401).send({message: 'Falha na autenticação'});
            }
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.userLogin = async (req, res) => {

    try {
        const query = 'SELECT * FROM users WHERE cpf = ?'
        let result = await mysql.executeQuery(query, [req.body.cpf]);

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
                });
            } else {
                return res.status(401).send({message: 'Falha na autenticação'});
            }
        });

    } catch (e) {
        return res.status(500).send(e);
    }
}
