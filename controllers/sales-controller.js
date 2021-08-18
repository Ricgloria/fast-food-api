const mysql = require('../mysql');

const dayNameEnum = {
    Monday: 'Segunda',
    Tuesday: 'Terça',
    Wednesday: 'Quarta',
    Thursday: 'Quinta',
    Friday: 'Sexta',
    Saturday: 'Sábado',
    Sunday: 'Domingo'
}

function joinDaysOfWeek(days = []) {
    return days.map(day => {
        return {
            name: dayNameEnum[day.name],
            total: Number(day.total)
        }
    });
}

function transformSale(result) {
    return result.map(res => {
        return {
            id_sale: res.id_sale,
            sale_date: res.sale_date,
            sale_value: Number(res.sale_value),
            name: res.name,
            description: res.description
        }
    })
}

function reportMap(salesType, paymentMethods, users, deliverymen, itemsSale, total, lastMonth, lastSevenDays, sixMonth, allSales) {
    return {
        total: total[0].total,
        salesType,
        paymentMethods,
        users,
        deliverymen,
        itemsSale,
        lastMonth,
        lastSevenDays,
        sixMonth,
        allSales
    }
}

exports.postSale = async (req, res) => {

    const obj = {
        id_payment_method: req.body.id_payment_method,
        sale_value: req.body.sale_value,
        sale_date: new Date(),
        id_user: req.body.id_user,
        sales_type_id: req.body.sales_type_id,
        delivery_address: req.body.delivery_address,
        note: req.body.note,
        id_deliveryman: req.body.id_deliveryman
    }

    try {
        let query = `INSERT INTO sales (sale_date, sale_value, id_user, id_payment_method, sales_type_id,
                                        delivery_address, note, id_deliveryman)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await mysql.executeQuery(query,
            [
                obj.sale_date,
                obj.sale_value,
                obj.id_user,
                obj.id_payment_method,
                obj.sales_type_id,
                obj.delivery_address,
                obj.note,
                obj.id_deliveryman
            ]);

        const products = req.body.send_products.map(prod => {
            return [
                prod.amount,
                result.insertId,
                prod.id_product
            ]
        });

        query = `INSERT INTO sales_items (amount, id_sale, id_product)
                 VALUES ?`;
        await mysql.executeQuery(query, [products]);

        return res.status(201).send({insertId: result.insertId});
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getAllSales = async (req, res) => {
    try {
        let query;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        if (startDate && endDate) {
            query = `SELECT sa.id_sale, sa.sale_date, sa.sale_value, u.name, pm.description
                     FROM sales sa
                              INNER JOIN users u on u.id_user = sa.id_user
                              INNER JOIN payment_methods pm on sa.id_payment_method = pm.id_payment_method
                     WHERE DATE(sa.sale_date) >= '${startDate}'
                       AND DATE(sa.sale_date) <= '${endDate}'
                     ORDER BY sa.sale_date DESC`;
        } else {
            query = `SELECT sa.id_sale, sa.sale_date, sa.sale_value, u.name, pm.description
                     FROM sales sa
                              INNER JOIN users u on u.id_user = sa.id_user
                              INNER JOIN payment_methods pm on sa.id_payment_method = pm.id_payment_method
                     ORDER BY sa.sale_date DESC`;
        }

        const result = await mysql.executeQuery(query);
        const sales = transformSale(result);
        res.status(200).send(sales);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getSalesReports = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const salesType = await getSalesTypeReports(startDate, endDate);
        const paymentMethods = await getPaymentTypesReports(startDate, endDate);
        const users = await getUsersReports(startDate, endDate);
        const deliverymen = await getDeliveryManReports(startDate, endDate);
        const itemsSale = await getItemSaleReports(startDate, endDate);
        const totalItemsSale = await getTotalItemSaleReports(startDate, endDate);
        const lastMonth = await getLastMonthReports();
        const days = await getLastSevenDaysReports();
        const sixMonth = await getLastSixMonthReports();
        const allSales = await getAllSalesReports(startDate, endDate);
        res.status(200).send(reportMap(salesType,
            paymentMethods,
            users, deliverymen, itemsSale, totalItemsSale, lastMonth, joinDaysOfWeek(days), sixMonth.reverse(), allSales));
    } catch (e) {
        return res.status(500).send(e);
    }
}

async function getSalesTypeReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT sl.name, COUNT(CASE WHEN sl.sales_type_id = sales.sales_type_id THEN 1 END) as total
                 FROM sales
                          JOIN sales_type sl on sl.sales_type_id = sales.sales_type_id
                 WHERE DATE(sales.sale_date) >= '${startDate}'
                   AND DATE(sales.sale_date) <= '${endDate}'
                 GROUP BY sl.name, sales.sales_type_id`;

    } else {
        query = `SELECT sl.name, COUNT(CASE WHEN sl.sales_type_id = sales.sales_type_id THEN 1 END) as total
                 FROM sales
                          JOIN sales_type sl on sl.sales_type_id = sales.sales_type_id
                 GROUP BY sl.name, sales.sales_type_id`;
    }
    return await mysql.executeQuery(query, []);
}

async function getPaymentTypesReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT pm.description                                                             as name,
                        COUNT(CASE WHEN pm.id_payment_method = sales.id_payment_method THEN 1 END) as total
                 FROM sales
                          JOIN payment_methods as pm on pm.id_payment_method = sales.id_payment_method
                 WHERE DATE(sales.sale_date) >= '${startDate}'
                   AND DATE(sales.sale_date) <= '${endDate}'
                 GROUP BY pm.description, sales.id_payment_method`;
    } else {
        query = `SELECT pm.description                                                             as name,
                        COUNT(CASE WHEN pm.id_payment_method = sales.id_payment_method THEN 1 END) as total
                 FROM sales
                          JOIN payment_methods as pm on pm.id_payment_method = sales.id_payment_method
                 GROUP BY pm.description, sales.id_payment_method`;
    }

    return await mysql.executeQuery(query, []);
}

async function getUsersReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT u.name, COUNT(sales.id_user) total
                 FROM sales
                          JOIN users u on sales.id_user = u.id_user
                 WHERE DATE(sales.sale_date) >= '${startDate}'
                   AND DATE(sales.sale_date) <= '${endDate}'
                 GROUP BY u.name`;
    } else {
        query = `SELECT u.name, COUNT(sales.id_user) total
                 FROM sales
                          JOIN users u on sales.id_user = u.id_user
                 GROUP BY u.name`;
    }
    return await mysql.executeQuery(query, []);
}

async function getDeliveryManReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT delivery.name, COUNT(sales.id_deliveryman) total
                 FROM sales
                          JOIN deliveryman delivery on sales.id_deliveryman = delivery.id_deliveryman
                 WHERE DATE(sales.sale_date) >= '${startDate}'
                   AND DATE(sales.sale_date) <= '${endDate}'
                 GROUP BY delivery.name`;
    } else {
        query = `SELECT delivery.name, COUNT(sales.id_deliveryman) total
                 FROM sales
                          JOIN deliveryman delivery on sales.id_deliveryman = delivery.id_deliveryman
                 GROUP BY delivery.name`;
    }
    return await mysql.executeQuery(query, []);
}

async function getItemSaleReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT p.product_name as name, SUM(sali.amount) as total
                 FROM sales_items sali
                          JOIN products p ON p.id_product = sali.id_product
                          JOIN sales s ON s.id_sale = sali.id_sale
                 WHERE DATE(s.sale_date) >= '${startDate}'
                   AND DATE(s.sale_date) <= '${endDate}'
                 GROUP BY p.product_name
                 ORDER BY total DESC;`
    } else {
        query = `SELECT p.product_name as name, SUM(sali.amount) as total
                 FROM sales_items sali
                          join products p on p.id_product = sali.id_product
                 GROUP BY p.product_name
                 ORDER BY total DESC;`
    }

    return await mysql.executeQuery(query, []);
}

async function getTotalItemSaleReports(startDate, endDate) {

    let query;
    if (startDate && endDate) {
        query = `SELECT SUM(amount) total
                 FROM sales_items
                          JOIN sales s ON s.id_sale = sales_items.id_sale
                 WHERE DATE(s.sale_date) >= '${startDate}'
                   AND DATE(s.sale_date) <= '${endDate}'`
    } else {
        query = `SELECT SUM(amount) total
                 FROM sales_items;`
    }

    return await mysql.executeQuery(query, []);
}

async function getLastMonthReports() {
    const query = `SELECT DATE_FORMAT(sa.sale_date, '%d/%m') as name, SUM(sa.sale_value) total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW())
                   GROUP BY name;`
    return await mysql.executeQuery(query, []);
}

async function getLastSevenDaysReports() {
    const query = `SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 6 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 6 DAY)
                   UNION
                   SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 5 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 5 DAY)
                   UNION
                   SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 4 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 4 DAY)
                   UNION
                   SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 3 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 3 DAY)
                   UNION
                   SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 2 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 2 DAY)
                   UNION
                   SELECT DAYNAME(DATE_ADD(NOW(), INTERVAL - 1 DAY))    as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW() + INTERVAL - 1 DAY)
                   UNION
                   SELECT DAYNAME(NOW())                                as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE DATE(sa.sale_date) = DATE(NOW());`
    return await mysql.executeQuery(query, []);
}

async function getLastSixMonthReports() {
    const query = `SELECT DATE_FORMAT(CURDATE(), '%m/%y')               as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0) as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW())
                   UNION
                   SELECT DATE_FORMAT(CURDATE() + INTERVAL - 1 MONTH, '%m/%y') as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0)        as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW() + INTERVAL - 1 MONTH)
                   UNION
                   SELECT DATE_FORMAT(CURDATE() + INTERVAL - 2 MONTH, '%m/%y') as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0)        as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW() + INTERVAL - 2 MONTH)
                   UNION
                   SELECT DATE_FORMAT(CURDATE() + INTERVAL - 3 MONTH, '%m/%y') as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0)        as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW() + INTERVAL - 3 MONTH)
                   UNION
                   SELECT DATE_FORMAT(CURDATE() + INTERVAL - 4 MONTH, '%m/%y') as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0)        as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW() + INTERVAL - 4 MONTH)
                   UNION
                   SELECT DATE_FORMAT(CURDATE() + INTERVAL - 5 MONTH, '%m/%y') as name,
                          IF(SUM(sa.sale_value), SUM(sa.sale_value), 0)        as total
                   FROM sales sa
                   WHERE MONTH(sa.sale_date) = MONTH(NOW() + INTERVAL - 5 MONTH);`
    return await mysql.executeQuery(query, []);
}

async function getAllSalesReports(startDate, endDate) {
    let query;
    if (startDate && endDate) {
        query = `SELECT DATE_FORMAT(sa.sale_date, '%m/%y') as name, SUM(sa.sale_value) total
                 FROM sales sa
                 WHERE DATE(sa.sale_date) >= '${startDate}'
                   AND DATE(sa.sale_date) <= '${endDate}'
                 GROUP BY name;`
    } else {
        query = `SELECT DATE_FORMAT(sa.sale_date, '%m/%y') as name, SUM(sa.sale_value) total
                 FROM sales sa
                 GROUP BY name;`
    }
    return await mysql.executeQuery(query, []);
}




