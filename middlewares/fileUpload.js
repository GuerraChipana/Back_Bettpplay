import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Directorio temporal para guardar los archivos
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // No hacemos ninguna lógica de renombrado aquí, simplemente usamos el nombre del archivo como está
        const nombreArchivo = file.originalname;
        cb(null, nombreArchivo);
    }
});

// Middleware de multer para procesar el archivo
const upload = multer({ storage: storage });

export default upload.single('imagen');  // 'imagen' es el nombre del campo de archivo en el formulario
