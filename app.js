import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import { orderRoutes, productRoutes, userRoutes } from './routes/index.js'

const app = express()
dotenv.config()
connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/', (req, res) => res.send('Hello World'))

app.use('/api/users', userRoutes)
app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use('/*', (req, res) =>
  res
    .status(404)
    .json({
      message: `${req.protocol + '://' + req.get('host') + req.originalUrl} url not found`,
      success: false,
    })
)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server ishga tushdi. Port ${port}`.yellow.bold))

export default app
