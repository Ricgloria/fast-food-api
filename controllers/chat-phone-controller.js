const mysql = require('../mysql');

function transformGetChat(chats) {
    return {
        id_chat_phone: chats[0].id_chat_phone,
        phone: chats[0].phone
    }
}

exports.getChatPhone = async (req, res) => {
    try {
        const query = 'SELECT * FROM chat_phone WHERE id_chat_phone = 1';
        const result = await mysql.executeQuery(query);
        const chat = transformGetChat(result);
        res.status(200).send(chat);
    } catch (e) {
        return res.status(500).send(e);
    }
}

exports.patchChatPhone = async (req, res) => {
    try {
        const query = `UPDATE chat_phone
                       SET phone = ?
                       WHERE id_chat_phone = 1`;
        await mysql.executeQuery(query, [
            req.body.phone,
        ]);
        res.status(201).send({message: 'Telefone de chat editado com sucesso'});
    } catch (e) {
        return res.status(500).send(e);
    }
}
