import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_BUCKET_NAME, AWS_SECRET_KEY } from '../config/config.js';

const client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
});

// Subir imagen y retornar la URL
export async function subirFoto(file) {
    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: file.name,
        Body: file.data,
        ContentType: file.mimetype
    };

    const command = new PutObjectCommand(uploadParams);
    await client.send(command);

    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${file.name}`;
    return imageUrl;
}


// Eliminar una imagen
export async function eliminarFoto(filename) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: filename
        });
        await client.send(command);
        console.log(`Archivo ${filename} eliminado con éxito.`);
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        throw new Error('No se pudo eliminar el archivo');
    }
}


export async function modificarFoto(filename, nuevaFoto) {
    // Eliminar la imagen anterior
    await eliminarFoto(filename);

    // Subir la nueva imagen
    const imageUrl = await subirFoto(nuevaFoto);
    return imageUrl;
}


// Ver todos los nombes de las imágenes subidas 
export async function verFotos() {
    const command = new ListObjectsCommand({
        Bucket: AWS_BUCKET_NAME
    });
    const result = await client.send(command);
    return result.Contents.map(item => item.Key);
}

export async function obtenerFoto(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    });

    try {
        const result = await client.send(command);
        const bodyContents = await streamToString(result.Body);
        return bodyContents; 
    } catch (error) {
        console.error('Error al obtener la foto:', error);
        throw error; 
    }
}