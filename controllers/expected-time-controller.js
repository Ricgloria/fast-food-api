const mysql = require('../mysql');

function getFormattedExpectedTime(result) {
    return {
        id_expected_time: result[0].id_expected_time,
        name: result[0].name,
        time: result[0].time
    };
}

function getFormattedExpectedTimesArray(result = []) {
    return result.map(res => {
        return {
            id_expected_time: res.id_expected_time,
            name: res.name,
            time: res.time
        }
    })
}

exports.getExpectedTime = async (req, res) => {
    try {
        const query = 'SELECT * FROM expected_time';
        const result = getFormattedExpectedTimesArray(await mysql.executeQuery(query));
        res.status(200).send(result);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.patchExpectedTime = async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'UPDATE expected_time SET time = ? WHERE id_expected_time = ?';
        await mysql.executeQuery(query, [req.body.time, id]);
        res.status(201).send({message: 'Tempo editado com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}
