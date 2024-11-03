import db from '../database/db.js';

class ClientesDAO {
    // Crear un nuevo cliente
    async crearCliente(cliente) {
        const query = `
            INSERT INTO clientes (nombre_cliente, apellido_cliente, usuario_cliente, email_cliente, contraseña_cliente, fecha_registro)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const { nombre_cliente, apellido_cliente, usuario_cliente, email_cliente, contraseña_cliente } = cliente;

        try {
            await db.query(query, [nombre_cliente, apellido_cliente, usuario_cliente, email_cliente, contraseña_cliente]);
        } catch (error) {
            console.error('Error al crear cliente:', error);
            throw error;
        }
    }

    // Buscar cliente por email
    async buscarClientePorEmail(email_cliente) {
        const query = `
        SELECT * FROM clientes WHERE email_cliente = ?
    `;
        const [resultados] = await db.query(query, [email_cliente]);
        return resultados[0];
    }

    // Buscar cliente por nombre de usuario
    async buscarClientePorUsuario(usuario_cliente) {
        const query = `
            SELECT * FROM clientes WHERE usuario_cliente = ?
        `;
        const [resultados] = await db.query(query, [usuario_cliente]);
        return resultados[0];
    }

    // Buscar cliente por ID
    async buscarClientePorId(id) {
        const query = `
            SELECT * FROM clientes WHERE id = ?
        `;
        const [resultados] = await db.query(query, [id]);
        return resultados[0];
    }

    // Editar los datos de un cliente
    async editarCliente(id, datosActualizados) {
        const query = `
            UPDATE clientes SET 
                nombre_cliente = ?, 
                apellido_cliente = ?, 
                usuario_cliente = ?, 
                email_cliente = ?, 
                contraseña_cliente = ?, 
                fecha_modificacion = NOW() 
            WHERE id = ?
        `;
        const { nombre_cliente, apellido_cliente, usuario_cliente, email_cliente, contraseña_cliente } = datosActualizados;

        try {
            await db.query(query, [nombre_cliente, apellido_cliente, usuario_cliente, email_cliente, contraseña_cliente, id]);
        } catch (error) {
            console.error('Error al editar cliente:', error);
            throw error;
        }
    }

    // Listar todos los clientes
    async listarClientes() {
        const query = `
            SELECT id, nombre_cliente, apellido_cliente, email_cliente, estado_cliente FROM clientes
        `;
        const [resultados] = await db.query(query);
        return resultados;
    }

    // Cambiar el estado de un cliente
    async cambiarEstadoCliente(id, nuevoEstado, id_user_modificacion) {
        const query = `
            UPDATE clientes SET estado_cliente = ?, id_user_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?
        `;
        try {
            await db.query(query, [nuevoEstado, id_user_modificacion, id]);
        } catch (error) {
            console.error('Error al cambiar estado de cliente:', error);
            throw error;
        }
    }
}

export default new ClientesDAO();
