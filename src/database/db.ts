import { DataSource } from "typeorm"
import {User} from "../entities/user.entity";
import {Category} from "../entities/category.entity";
import {Product} from "../entities/product.entity";
import {Order} from "../entities/order.entity";
import {OrderDetailsEntity} from "../entities/orderDetails.entity";

const host: string = process.env.DB_HOST || 'localhost';
const port: number = Number(process.env.DB_PORT) || 5432;
const username: string = process.env.DB_USERNAME || 'root';
const password: string = process.env.DB_PASSWORD || 'root';
const database: string = process.env.DATABASE || 'database';

export class DataBase {
    private static instance: DataBase;
    private typeormDataSource: DataSource;
    private readonly host: string;
    private readonly port: number;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;

    private constructor(
        host: string,
        port: number,
        username: string,
        password: string,
        database: string
    ) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.database = database;
        this.typeormDataSource = new DataSource({
            type: "postgres",
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
            database: this.database,
            entities: [User, Category, Product, Order, OrderDetailsEntity],
            synchronize: true
        })
    }

    public static getDataBaseInstance(): DataBase {
        if (!DataBase.instance) {
            DataBase.instance = new DataBase(host, port, username, password, database);
        }
        return DataBase.instance;
    }

    public getDataSource(): DataSource {
        return this.typeormDataSource;
    }

     public async init() {
        try {
            await this.typeormDataSource.initialize()
            await this.typeormDataSource.query('SELECT 1')
            console.log(`✔ Base de datos conectada correctamente`)
        } catch (error) {
            console.error(`✘ Error al conectar a la base de datos`, error)
            process.exit(1)
        }
    }
}