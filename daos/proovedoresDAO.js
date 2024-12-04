import db from "../database/db.js";

class ProveedoresDAO {
    async agregarProveedor(datosProveedor) {
        const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, categorias, id_user_creacion } = datosProveedor;

        try {
            const queryInsertar = `
                INSERT INTO proveedores 
                (nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, id_user_creacion, fecha_registro) 
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await db.query(queryInsertar, [
                nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, id_user_creacion
            ]);

            const proveedorId = result.insertId;

            if (categorias && categorias.length > 0) {
                const queryCategoria = `INSERT INTO proveedor_categoria (id_proveedor, id_categoria, estado) VALUES (?, ?, 1)`;
                for (const catId of categorias) {
                    await db.query(queryCategoria, [proveedorId, catId]);
                }
            }

            return proveedorId;
        } catch (error) {
            throw new Error('Error al agregar proveedor: ' + error.message);
        }
    }

    async verificarProveedorExistente(nombre, telefono, email, direccion, id = null) {
        let query = `
            SELECT id, nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, 
            estado_proveedor, id_user_creacion, fecha_registro, id_user_modificacion, 
            IFNULL(fecha_modificacion, 'No modificado') AS fecha_modificacion 
            FROM proveedores 
            WHERE (email_proveedor = ? OR nombre_proveedor = ? 
            OR telefono_proveedor = ? OR direccion_proveedor = ?)
        `;
        const params = [email, nombre, telefono, direccion];

        if (id) {
            query += ' AND ID != ?';
            params.push(id);
        }

        const [result] = await db.query(query, params);

        console.log('Proveedores existentes encontrados:', result);
        return result;
    }


    async editarProveedor(id, datosProveedor, id_user_modificacion) {
        const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, categorias } = datosProveedor;

        try {
            const queryActualizar = `
                UPDATE proveedores 
                SET nombre_proveedor = ?, telefono_proveedor = ?, email_proveedor = ?, 
                    direccion_proveedor = ?, fecha_modificacion = NOW(), id_user_modificacion = ?
                WHERE ID = ?
            `;
            const [result] = await db.query(queryActualizar, [
                nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, id_user_modificacion, id
            ]);

            if (result.affectedRows === 0) throw new Error("No se pudo actualizar el proveedor");

            // Eliminar categorías existentes y agregar nuevas
            await db.query('DELETE FROM proveedor_categoria WHERE id_proveedor = ?', [id]);

            if (categorias && categorias.length > 0) {
                const queryCategoria = `INSERT INTO proveedor_categoria (id_proveedor, id_categoria, estado) VALUES (?, ?, 1)`;
                for (const catId of categorias) {
                    await db.query(queryCategoria, [id, catId]);
                }
            }

            return { id, datosProveedor };
        } catch (error) {
            throw new Error('Error en la base de datos al editar el proveedor.');
        }
    }

    async cambiarEstadoProveedor(id, estado_proveedor, id_user_modificacion) {
        const [proveedorActual] = await db.query('SELECT * FROM proveedores WHERE ID = ?', [id]);
        if (proveedorActual.length === 0) throw new Error("Proveedor no encontrado");

        // Actualizar estado del proveedor
        const queryActualizarEstado = `
            UPDATE proveedores
            SET ESTADO_PROVEEDOR = ?, fecha_modificacion = NOW(), id_user_modificacion = ?
            WHERE ID = ?`;

        const result = await db.query(queryActualizarEstado, [
            estado_proveedor,
            id_user_modificacion,
            id
        ]);

        if (result.affectedRows === 0) throw new Error("No se pudo cambiar el estado del proveedor");

        // Cambiar estado en la tabla puente
        const estadoCategoria = estado_proveedor === 'inactivo' ? 'inactivo' : 'activo';
        await db.query(`
            UPDATE proveedor_categoria
            SET estado = ?
            WHERE id_proveedor = ?
        `, [estadoCategoria, id]);

        return { id, estado_proveedor };
    }

    async listarProveedores() {
        const query = `
            SELECT 
                p.id, 
                p.nombre_proveedor, 
                p.telefono_proveedor, 
                p.email_proveedor, 
                p.direccion_proveedor, 
                p.estado_proveedor,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'nombre_categoria', c.nombre_categoria
                    )
                ) AS categorias
            FROM proveedores p
            LEFT JOIN proveedor_categoria pc ON p.id = pc.id_proveedor
            LEFT JOIN categorias c ON pc.id_categoria = c.id
            GROUP BY p.id, p.nombre_proveedor, p.telefono_proveedor, 
                     p.email_proveedor, p.direccion_proveedor, p.estado_proveedor
        `;
    
        const [result] = await db.query(query);
        return result;
    }
    

}

export default new ProveedoresDAO();
