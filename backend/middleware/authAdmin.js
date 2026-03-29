import jwt from 'jsonwebtoken'

// Admin authentication middleware
const authAdmin = (req, res, next) => {
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

        const aToken = authHeader.split(' ')[1]

        if (!aToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, login again'
            })
        }

        const decoded = jwt.verify(aToken, process.env.JWT_SECRET)

        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, login again'
            })
        }

        req.adminEmail = decoded.email
        next()

    } catch (error) {

        console.log('Error verifying admin token:', error.message)

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        })
    }
}

export default authAdmin