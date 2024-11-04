import db from "../database/db.js";

class ProveedoresDAO {
    async agregarProveedor(datosProveedor) {
        const { nombre_proveedor, telefono_proveedor, email_proveedor, direccion_proveedor, categorias, id_user_creacion } = datosProveedor;

        try {
            const queryInsertar = `
                INSERT INTO PROVEEDORES 
                (NOMBRE_PROVEEDOR, TELEFONO_PROVEEDOR, EMAIL_PROVEEDOR, DIRECCION_PROVEEDOR, ID_USER_CREACION, FECHA_REGISTRO) 
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
            FROM PROVEEDORES 
            WHERE (EMAIL_PROVEEDOR = ? OR NOMBRE_PROVEEDOR = ? 
            OR TELEFONO_PROVEEDOR = ? OR DIRECCION_PROVEEDOR = ?)
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
                UPDATE PROVEEDORES 
                SET NOMBRE_PROVEEDOR = ?, TELEFONO_PROVEEDOR = ?, EMAIL_PROVEEDOR = ?, 
                    DIRECCION_PROVEEDOR = ?, FECHA_MODIFICACION = NOW(), ID_USER_MODIFICACION = ?
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
        const [proveedorActual] = await db.query('SELECT * FROM PROVEEDORES WHERE ID = ?', [id]);
        if (proveedorActual.length === 0) throw new Error("Proveedor no encontrado");

        // Actualizar estado del proveedor
        const queryActualizarEstado = `
            UPDATE PROVEEDORES
            SET ESTADO_PROVEEDOR = ?, FECHA_MODIFICACION = NOW(), ID_USER_MODIFICACION = ?
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
                GROUP_CONCAT(pc.id_categoria) AS categorias
            FROM PROVEEDORES p
            LEFT JOIN proveedor_categoria pc ON p.id = pc.id_proveedor
            GROUP BY p.id, p.nombre_proveedor, p.telefono_proveedor, 
                     p.email_proveedor, p.direccion_proveedor, p.estado_proveedor
        `;

        const [result] = await db.query(query);
        return result;
    }

}

export default new ProveedoresDAO();
