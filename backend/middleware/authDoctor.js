import jwt from 'jsonwebtoken'

// Doctor authentication middleware
const authDoctor = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, login again'
            })
        }

        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            })
        }

        const dtoken = authHeader.split(' ')[1]

        if (!dtoken) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, login again'
            })
        }

        // Verify token
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)

        // Attach user info safely to req
        req.docId = { id: decoded.id }

        next()

    } catch (error) {
        console.log('Error verifying user token:', error.message)

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        })
    }
}

export default authDoctor