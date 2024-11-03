import ProveedoresServicio from '../services/proveedorServicio.js';

class ProveedorController {
    async agregarProveedor(req, res) {
        try {
            const nuevoProveedor = await ProveedoresServicio.agregarProveedor(req.body);
            res.status(201).json({ message: 'Proveedor agregado con éxito', id: nuevoProveedor });
        } catch (error) {
            console.error('Error al agregar proveedor:', error); // Log para depuración
            res.status(400).json({ error: error.message || 'Error desconocido' });
        }
    }

    async editarProveedor(req, res) {
        const { id } = req.params;

        try {
            const proveedorEditado = await ProveedoresServicio.editarProveedor(id, req.body, req.user.id);
            res.status(200).json({ message: 'Proveedor editado con éxito', proveedor: proveedorEditado });
        } catch (error) {
            console.error('Error al editar proveedor:', error);  
            res.status(400).json({ error: error.message || 'Error desconocido' });
        }
    }

    async cambiarEstadoProveedor(req, res) {
        const { id } = req.params;
        const { estado_proveedor } = req.body;

        try {
            const proveedorEstadoCambiado = await ProveedoresServicio.cambiarEstadoProveedor(id, estado_proveedor, req.user.id);
            res.status(200).json({ message: 'Estado del proveedor cambiado con éxito', proveedor: proveedorEstadoCambiado });
        } catch (error) {
            res.status(400).json({ error: error.message || 'Error desconocido' });
        }
    }

    async listarProveedores(req, res) {
        try {
            const proveedores = await ProveedoresServicio.listarProveedores();
            res.status(200).json(proveedores);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar proveedores: ' + error.message });
        }
    }
}

export default new ProveedorController();
