import proveedoresDAO from '../daos/proovedoresDAO.js';

class ProveedoresServicio {
    async agregarProveedor(datosProveedor) {
        const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, categorias, id_user_creacion } = datosProveedor;

        try {
            // Validaciones de campos obligatorios
            if (!nombre_proveedor) throw new Error('El nombre del proveedor es obligatorio.');
            if (!telefono_proveedor) throw new Error('El teléfono del proveedor es obligatorio.');
            if (!email_proveedor) throw new Error('El email del proveedor es obligatorio.');
            if (!direccion_proveedor) throw new Error('La dirección del proveedor es obligatoria.');

            // Validaciones de formato
            const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!emailPattern.test(email_proveedor)) {
                throw new Error('El email debe ser una dirección de Gmail que termine en @gmail.com.');
            }

            const telefonoPattern = /^\d{9,11}$/;
            if (!telefonoPattern.test(telefono_proveedor)) {
                throw new Error('El teléfono debe tener entre 9 y 11 dígitos.');
            }

            // Verificar proveedores existentes
            const proveedoresExistentes = await proveedoresDAO.verificarProveedorExistente(
                nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, null
            );

            if (proveedoresExistentes.length > 0) {
                let errores = [];

                for (const proveedor of proveedoresExistentes) {
                    if (proveedor.nombre_proveedor === nombre_proveedor) {
                        errores.push(`El nombre "${nombre_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.telefono_proveedor === telefono_proveedor) {
                        errores.push(`El teléfono "${telefono_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.email_proveedor === email_proveedor) {
                        errores.push(`El email "${email_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.direccion_proveedor === direccion_proveedor) {
                        errores.push(`La dirección "${direccion_proveedor}" ya está en uso.`);
                    }
                }

                // Retornar los errores concatenados
                throw new Error(errores.join(' '));
            }

            return await proveedoresDAO.agregarProveedor(datosProveedor);
        } catch (error) {
            throw new Error(`Error en agregar proveedor: ${error.message}`);
        }
    }

    async editarProveedor(id, datosProveedor, id_user_modificacion) {
        const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, categorias } = datosProveedor;

        try {
            // Validaciones de campos obligatorios
            if (!nombre_proveedor) throw new Error('El nombre del proveedor es obligatorio.');
            if (!telefono_proveedor) throw new Error('El teléfono del proveedor es obligatorio.');
            if (!email_proveedor) throw new Error('El email del proveedor es obligatorio.');
            if (!direccion_proveedor) throw new Error('La dirección del proveedor es obligatoria.');

            // Validaciones de formato
            const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!emailPattern.test(email_proveedor)) {
                throw new Error('El email debe ser una dirección de Gmail que termine en @gmail.com.');
            }

            const telefonoPattern = /^\d{9,11}$/;
            if (!telefonoPattern.test(telefono_proveedor)) {
                throw new Error('El teléfono debe tener entre 9 y 11 dígitos.');
            }

            // Verificar si existe un proveedor con los mismos datos, excluyendo el actual
            const proveedoresExistentes = await proveedoresDAO.verificarProveedorExistente(
                nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, id
            );

            if (proveedoresExistentes.length > 0) {
                let errores = [];

                // Validar si los campos están duplicados
                for (const proveedor of proveedoresExistentes) {
                    if (proveedor.nombre_proveedor === nombre_proveedor) {
                        errores.push(`El nombre "${nombre_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.telefono_proveedor === telefono_proveedor) {
                        errores.push(`El teléfono "${telefono_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.email_proveedor === email_proveedor) {
                        errores.push(`El email "${email_proveedor}" ya está en uso.`);
                    }
                    if (proveedor.direccion_proveedor === direccion_proveedor) {
                        errores.push(`La dirección "${direccion_proveedor}" ya está en uso.`);
                    }
                }

                throw new Error(errores.join(' '));
            }

            // Actualizar proveedor en la base de datos
            return await proveedoresDAO.editarProveedor(id, datosProveedor, id_user_modificacion);
        } catch (error) {
            throw new Error('Error en editar proveedor: ' + (error.message || 'No se proporcionó mensaje de error.'));
        }
    }


    async cambiarEstadoProveedor(id, estado, id_user_modificacion) {
        const estadosValidos = ['activo', 'inactivo'];
        if (!estadosValidos.includes(estado)) {
            throw new Error(`Estado no válido. Debe ser uno de: ${estadosValidos.join(', ')}`);
        }

        return await proveedoresDAO.cambiarEstadoProveedor(id, estado, id_user_modificacion);
    }

    async listarProveedores() {
        return await proveedoresDAO.listarProveedores();
    }
}

export default new ProveedoresServicio();
