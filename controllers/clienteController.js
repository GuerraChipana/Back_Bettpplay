import ClientesService from '../services/clienteServicio.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class ClientesController {
    // Registrar un nuevo cliente
    static async registrar(req, res) {
        try {
            const cliente = await ClientesService.crearCliente(req.body);
            res.status(201).json({ mensaje: 'Cliente registrado exitosamente.', cliente });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Iniciar sesión
static async login(req, res) {
    const { usuario_cliente, contraseña_cliente } = req.body;
    try {
        const cliente = await ClientesService.buscarClientePorUsuario(usuario_cliente);
        if (!cliente || !(await bcrypt.compare(contraseña_cliente, cliente.contraseña_cliente))) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Verificar si el estado del cliente es activo
        if (cliente.estado_cliente !== 'activo') {
            return res.status(403).json({ error: 'El usuario no está activo.' });
        }

        const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ mensaje: 'Inicio de sesión exitoso.', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

    // Editar mis datos
    static async editarMisDatos(req, res) {
        const id_cliente = req.user.id; // Obtener ID del cliente del token
        try {
            const clienteActualizado = await ClientesService.editarMisDatos(id_cliente, req.body);
            res.json({ mensaje: 'Datos actualizados exitosamente.', cliente: clienteActualizado });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    // Listar todos los clientes (solo para administradores)
    static async listarClientes(req, res) {
        try {
            const clientes = await ClientesService.listarClientes();
            res.json(clientes);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Cambiar estado de un cliente (solo para administradores)
    static async cambiarEstadoCliente(req, res) {
        const { nuevoEstado } = req.body;
        const id_cliente = req.params.id; // ID del cliente a cambiar el estado
        const id_user_modificacion = req.user.id; // ID del administrador que modifica el estado

        try {
            await ClientesService.cambiarEstadoCliente(id_cliente, nuevoEstado, id_user_modificacion);
            res.json({ mensaje: 'Estado del cliente actualizado exitosamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default ClientesController;
