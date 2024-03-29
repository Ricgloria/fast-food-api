const mysql = require('../mysql');

function transformProducts(products) {
    return products.map(pro => {
        return {
            id_product: pro.id_product,
            product_name: pro.product_name,
            product_value: Number(pro.product_value),
            product_discount_value: Number(pro.product_discount_value),
            details: pro.details,
            id_discount: pro.id_discount,
            status: pro.status
        }
    });
}

function getProduct(result) {
    return {
        id_product: result[0].id_product,
        product_name: result[0].product_name,
        product_value: Number(result[0].product_value),
        product_discount_value: Number(result[0].product_discount_value),
        id_discount: result[0].id_discount,
        details: result[0].details,
        status: result[0].status
    };
}

exports.getProducts = async (req, res) => {

    try {
        const query = 'SELECT * FROM products';
        const result = await mysql.executeQuery(query);
        const products = transformProducts(result);
        res.status(200).send(products);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getProductsForSales = async (req, res) => {
    try {
        const query = 'SELECT * FROM products WHERE status = 1 ORDER BY product_name';
        const result = await mysql.executeQuery(query);
        const products = transformProducts(result);
        res.status(200).send(products);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getProductById = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `SELECT *
                       FROM products
                       WHERE id_product = ?`;
        const result = await mysql.executeQuery(query, [id]);

        if (!result.length) {
            return res.status(404).send('Não encontrado')
        }

        const product = getProduct(result);
        res.status(200).json(product);
    } catch (e) {
        return res.status(500).send(e);
    }
}

function getDiscountRate(discountTable) {
    return discountTable[0].discount_rate
}

exports.postProduct = async (req, res) => {

    try {

        let query = 'SELECT discount_rate FROM discount WHERE id_discount = 1';
        const productDiscountValue = req.body.product_value - (req.body.product_value * getDiscountRate(await mysql.executeQuery(query)) / 100);

        query = 'INSERT INTO products (product_name, product_value, product_discount_value, details, status) VALUES (?, ?, ?, ?, ?)';
        const result = await mysql.executeQuery(query,
            [req.body.product_name, req.body.product_value, productDiscountValue, req.body.details, req.body.status]);

        query = 'SELECT * FROM products WHERE id_product = ?';
        const res2 = await mysql.executeQuery(query, [result.insertId]);
        const product = getProduct(res2);
        res.status(201).json(product);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.putProduct = async (req, res) => {

    try {

        let query = 'SELECT discount_rate FROM discount WHERE id_discount = 1';
        const productDiscountValue = req.body.product_value - (req.body.product_value * getDiscountRate(await mysql.executeQuery(query)) / 100);

        query = `UPDATE products
                 SET product_name           = ?,
                     product_value          = ?,
                     product_discount_value = ?,
                     details                = ?,
                     status                 = ?,
                     id_discount            = ?
                 WHERE id_product = ?`;
        await mysql.executeQuery(query,
            [req.body.product_name, req.body.product_value, productDiscountValue, req.body.details, req.body.status, req.body.id_discount, req.params.id]);

        query = 'SELECT * FROM products WHERE id_product = ?';
        const result = await mysql.executeQuery(query, [req.params.id]);
        const product = getProduct(result);
        res.status(201).json(product);
    } catch (e) {
        console.log(e)
        return res.status(500).send(e);
    }
}

exports.deleteProduct = async (req, res) => {

    try {
        const id = req.params.id;
        const query = `DELETE
                       FROM products
                       WHERE id_product = ?`;
        await mysql.executeQuery(query, [id]);
        res.status(202).send({
            message: 'Produto excluído com sucesso'
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}
