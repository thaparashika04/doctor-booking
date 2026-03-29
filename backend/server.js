import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000

// middlewares
app.use(cors())
app.use(express.json())

// api endpoint
app.use('/admin', adminRouter)
app.use('/doctor', doctorRouter)
app.use('/user', userRouter)

// start server only after DB connects
const startServer = async () => {
  try {
    await connectDB()
    connectCloudinary()

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  } catch (error) {
    console.log('Server start failed:', error.message)
  }
}

startServer()
