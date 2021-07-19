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

const daysNameArray = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
]

function lastSevenDaysMap() {
    let result = [];
    for (let i = 0; i < 7; i++) {
        let newDate = new Date(new Date().setDate(new Date().getDate() - i));
        result.push({
            name: daysNameArray[newDate.getDay()],
            day: newDate.getDate(),
            total: 0
        });
    }
    return result;
}

function joinDaysOfWeek(lastSevenDays = [], days = []) {

    days = days.map(day => {
        return {
            name: day.name,
            day: day.day,
            total: day.total
        }
    });

    lastSevenDays.forEach(last => {
        days.forEach(day => {
            if (day.day === last.day && day.name === last.name) {
                last.total = day.total;
            }
        });
    })

    return lastSevenDays.map(day => {
        return {
            name: dayNameEnum[day.name],
            total: Number(day.total)
        }
    }).reverse();
}

function transformSale(result) {
    return result.map(res => {
        return {
            id_sale: res.id_sale,
            sale_date: res.sale_date,
            sale_value: res.sale_value,
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
        return res.status(201).send({message: 'Venda realizada com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getAllSales = async (req, res) => {
    try {
        const query = `SELECT sa.id_sale, sa.sale_date, sa.sale_value, u.name, pm.description
                       FROM sales sa
                                INNER JOIN users u on u.id_user = sa.id_user
                                INNER JOIN payment_methods pm on sa.id_payment_method = pm.id_payment_method
                       ORDER BY sa.sale_date DESC`;
        const result = await mysql.executeQuery(query);
        const sales = transformSale(result);
        res.status(200).send(sales);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.getSalesReports = async (req, res) => {
    try {
        const salesType = await getSalesTypeReports();
        const paymentMethods = await getPaymentTypesReports();
        const users = await getUsersReports();
        const deliverymen = await getDeliveryManReports();
        const itemsSale = await getItemSaleReports();
        const totalItemsSale = await getTotalItemSaleReports();
        const lastMonth = await getLastMonthReports();
        const lastSevenDays = lastSevenDaysMap();
        const days = await getLastSevenDaysReports();
        const sixMonth = await getLastSixMonthReports();
        const allSales = await getAllSalesReports();
        res.status(200).send(reportMap(salesType,
            paymentMethods,
            users, deliverymen, itemsSale, totalItemsSale, lastMonth, joinDaysOfWeek(lastSevenDays, days), sixMonth.reverse(), allSales));
    } catch (e) {
        return res.status(500).send(e);
    }
}

async function getSalesTypeReports() {
    let query = `SELECT sl.name, COUNT(CASE WHEN sl.sales_type_id = sales.sales_type_id THEN 1 END) as total
                 FROM sales
                          JOIN sales_type sl on sl.sales_type_id = sales.sales_type_id
                 GROUP BY sl.name, sales.sales_type_id`;

    return await mysql.executeQuery(query, []);
}

async function getPaymentTypesReports() {
    const query = `SELECT pm.description                                                             as name,
                          COUNT(CASE WHEN pm.id_payment_method = sales.id_payment_method THEN 1 END) as total
                   FROM sales
                            JOIN payment_methods as pm on pm.id_payment_method = sales.id_payment_method
                   GROUP BY pm.description, sales.id_payment_method`;
    return await mysql.executeQuery(query, []);
}

async function getUsersReports() {
    const query = `SELECT u.name, COUNT(sales.id_user) total
                   FROM sales
                            JOIN users u on sales.id_user = u.id_user
                   GROUP BY u.name`;
    return await mysql.executeQuery(query, []);
}

async function getDeliveryManReports() {

    const query = `SELECT delivery.name, COUNT(sales.id_deliveryman) total
                   FROM sales
                            JOIN deliveryman delivery on sales.id_deliveryman = delivery.id_deliveryman
                   GROUP BY delivery.name`;
    return await mysql.executeQuery(query, []);
}

async function getItemSaleReports() {
    const query = `SELECT p.product_name as name, SUM(sali.amount) as total
                   FROM sales_items sali
                            join products p on p.id_product = sali.id_product
                   GROUP BY p.product_name
                   ORDER BY total DESC;`
    return await mysql.executeQuery(query, []);
}

async function getTotalItemSaleReports() {
    const query = `SELECT SUM(amount) total
                   FROM sales_items;`
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
    const query = `SELECT DAYNAME(sa.sale_date) as name, DAY(sa.sale_date) as day, SUM(sa.sale_value) total
                   FROM sales sa
                   WHERE sa.sale_date >= DATE_SUB(now(), INTERVAL 7 DAY)
                   GROUP BY name;`
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

async function getAllSalesReports() {
    const query = `SELECT DATE_FORMAT(sa.sale_date, '%m/%y') as name, SUM(sa.sale_value) total
                   FROM sales sa
                   GROUP BY name;`
    return await mysql.executeQuery(query, []);
}




