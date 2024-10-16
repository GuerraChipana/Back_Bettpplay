import jwt from 'jsonwebtoken';

const authMiddleware = (rolesPermitidos = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (!rolesPermitidos.includes(decoded.rol)) {
                return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para esta acción.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token expirado o inválido.' });
        }
    };
};

export default authMiddleware;
