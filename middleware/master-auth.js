const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
         if(decode.permission === '1' || decode.permission === '2') {
             next();
         } else {
             return res.status(401).send({message: 'Acesso não autorizado'});
         }
    } catch (e) {
        return res.status(401).send({message: 'Acesso não autorizado'});
    }
}
