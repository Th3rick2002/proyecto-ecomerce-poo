import 'reflect-metadata'
import 'dotenv/config'
import express from "express";
import {DataBase} from "./database/db";
import userRoutes from "./routes/user.routes";

const app = express()

async function main() {
    const db = DataBase.getDataBaseInstance()
    await db.init()
}

main()

app.use(express.json());

app.use('/api/', userRoutes)

app.listen(3000, () => console.log('Server is running on port 3000'));