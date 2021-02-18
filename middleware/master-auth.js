const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
         if(decode.permission === 1) {
             next();
         } else {
             return res.status(401).send({message: 'Falha na autenticação'});
         }
    } catch (e) {
        return res.status(401).send({message: 'Falha na autenticação'});
    }
}
