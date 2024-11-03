import ClientesDAO from '../daos/clienteDAO.js';
import bcrypt from 'bcrypt';

class ClientesService {
    // Crear un nuevo cliente
    async crearCliente(cliente) {
        const clienteExistente = await ClientesDAO.buscarClientePorUsuario(cliente.usuario_cliente);
        if (clienteExistente) {
            throw new Error('El usuario ya existe.');
        }

        const hashedPassword = await bcrypt.hash(cliente.contraseña_cliente, 10);
        cliente.contraseña_cliente = hashedPassword;

        return await ClientesDAO.crearCliente(cliente);
    }

    // Buscar cliente por usuario
    async buscarClientePorUsuario(usuario_cliente) {
        return await ClientesDAO.buscarClientePorUsuario(usuario_cliente);
    }

    async editarMisDatos(id_cliente_modificacion, datosCliente) {
        // Obtener el cliente actual por su ID
        const clienteActual = await ClientesDAO.buscarClientePorId(id_cliente_modificacion);
        if (!clienteActual) {
            throw new Error('Cliente no encontrado.');
        }
    
        // Verificar la contraseña actual
        const esContraseñaCorrecta = await bcrypt.compare(datosCliente.contraseña_actual, clienteActual.contraseña_cliente);
        if (!esContraseñaCorrecta) {
            throw new Error('La contraseña actual es incorrecta.');
        }
    
        // Verificar si el nuevo usuario o correo ya existen
        if (datosCliente.usuario_cliente && datosCliente.usuario_cliente !== clienteActual.usuario_cliente) {
            const usuarioExistente = await ClientesDAO.buscarClientePorUsuario(datosCliente.usuario_cliente);
            if (usuarioExistente) {
                throw new Error('El usuario ya existe.');
            }
        }
    
        if (datosCliente.email_cliente && datosCliente.email_cliente !== clienteActual.email_cliente) {
            const emailExistente = await ClientesDAO.buscarClientePorEmail(datosCliente.email_cliente);
            if (emailExistente) {
                throw new Error('El correo ya está en uso.');
            }
        }
    
        // Actualizar datos
        const actualizados = {
            nombre_cliente: datosCliente.nombre_cliente || clienteActual.nombre_cliente,
            apellido_cliente: datosCliente.apellido_cliente || clienteActual.apellido_cliente,
            usuario_cliente: datosCliente.usuario_cliente || clienteActual.usuario_cliente,
            email_cliente: datosCliente.email_cliente || clienteActual.email_cliente,
        };
    
        // Si se proporciona una nueva contraseña
        if (datosCliente.contraseña_nueva) {
            if (datosCliente.contraseña_nueva !== datosCliente.confirmacion_contraseña) {
                throw new Error('La nueva contraseña y la confirmación no coinciden.');
            }
            const salt = await bcrypt.genSalt(10);
            actualizados.contraseña_cliente = await bcrypt.hash(datosCliente.contraseña_nueva, salt);
        }
    
        return await ClientesDAO.editarCliente(id_cliente_modificacion, actualizados);
    }
    

    // Listar todos los clientes
    async listarClientes() {
        return await ClientesDAO.listarClientes();
    }

    // Cambiar estado de un cliente
    async cambiarEstadoCliente(id, nuevoEstado, id_user_modificacion) {
        const clienteExistente = await ClientesDAO.buscarClientePorId(id);
        if (!clienteExistente) {
            throw new Error('Cliente no encontrado.');
        }
        return await ClientesDAO.cambiarEstadoCliente(id, nuevoEstado, id_user_modificacion);
    }

    // Buscar cliente por ID
    async buscarClientePorId(id) {
        return await ClientesDAO.buscarClientePorId(id);
    }
}

export default new ClientesService();
