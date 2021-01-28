const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        message: 'Funcionando'
    });
});

router.get('/:id', (req, res, next) => {

    const id = req.params.id;

    res.status(200).send({
        message: 'Funcionando'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).send({
        message: 'Funcionando'
    });
});

router.put('/:id', (req, res, next) => {
    res.status(200).send({
        message: 'Funcionando'
    });
});

router.delete('/:id', (req, res, next) => {
    res.status(200).send({
        message: 'Funcionando'
    });
});

module.exports = router;
