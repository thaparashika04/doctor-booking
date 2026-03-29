import jwt from 'jsonwebtoken'

// User authentication middleware
const authUser = (req, res, next) => {
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

        const token = authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, login again'
            })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach user info safely to req
        req.user = { id: decoded.id }

        next()

    } catch (error) {
        console.log('Error verifying user token:', error.message)

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        })
    }
}

export default authUser