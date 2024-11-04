import jwt from 'jsonwebtoken';

const authClientMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Almacena la información del usuario en la solicitud
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token expirado o inválido.' });
    }
};

export default authClientMiddleware;
