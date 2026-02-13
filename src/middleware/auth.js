// Simulación de un middleware de autenticación inseguro
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(401).send('No token');

    // ERROR 1: No se verifica la firma (algoritmo 'none' permitido o falta de secret)
    const decoded = jwt.decode(token); 
    
    // ERROR 2: Uso de un secreto débil hardcodeado para validación (en otra parte del código)
    // ERROR 3: No se verifica la expiración ni el emisor
    
    req.user = decoded;
    next();
}

async function login(username, password) {
    // ERROR 4: Uso de MD5 para contraseñas (obsoleto e inseguro)
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(password).digest('hex');
    
    const user = await db.findUser(username, hash);
    return jwt.sign({ id: user.id }, 'cge-secret-123'); // ERROR 5: Secreto débil
}
