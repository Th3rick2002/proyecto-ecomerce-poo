# Configuración de TypeORM y conexión a la base de datos

## Crear archivo para las variables de entorno

En el directorio raíz del proyecto crear el archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DATABASE=db_ecomerce
```

## Configuración de la Base de Datos (`src/database/db.ts`)

Se utiliza el patrón Singleton para manejar la conexión a la base de datos con TypeORM.

```typescript
import { DataSource } from "typeorm"
import { User } from "../entities/user.entity";
import { Category } from "../entities/category.entity";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";
import { OrderDetailsEntity } from "../entities/orderDetails.entity";

const host: string = process.env.DB_HOST || 'localhost';
const port: number = Number(process.env.DB_PORT) || 5432;
const username: string = process.env.DB_USERNAME || 'root';
const password: string = process.env.DB_PASSWORD || 'root';
const database: string = process.env.DATABASE || 'database';

export class DataBase {
    private static instance: DataBase;
    private readonly typeormDataSource: DataSource;

    private constructor(
        host: string,
        port: number,
        username: string,
        password: string,
        database: string
    ) {
        this.typeormDataSource = new DataSource({
            type: "postgres",
            host: host,
            port: port,
            username: username,
            password: password,
            database: database,
            entities: [User, Category, Product, Order, OrderDetailsEntity],
            synchronize: true,
            ssl: {
                rejectUnauthorized: false
            }
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
            console.log(`✔ Base de datos conectada correctamente`)
        } catch (error) {
            console.error(`✘ Error al conectar a la base de datos`, error)
            process.exit(1)
        }
    }
}
```

## Configuración de Docker

Usar el siguiente comando para crear el contenedor de Postgres:

```bash
docker run -d --name db_ecomerce -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v postgres_ecomerce_data:/var/lib/postgresql/data postgres:17-alpine
```

Crear la base de datos dentro del contenedor:

```bash
docker exec -it db_ecomerce psql -U postgres -c "CREATE DATABASE db_ecomerce"
```

## Entidades

Para mantener un orden, se utiliza una `BaseEntity` que contiene los campos comunes (`createdAt`, `updatedAt`).

### Base Entity (`src/entities/baseEntity.ts`)

```typescript
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

### Entidad Usuario (`src/entities/user.entity.ts`)

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./baseEntity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: "varchar", length: 50, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 25, unique: true, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    password: string;
}
```

### Otras Entidades y Relaciones

- **Category**: ID autoincremental, nombre único.
- **Product**: ID autoincremental, nombre, precio, stock, y relación ManyToOne con `Category`.
- **Order**: ID UUID, relación ManyToOne con `User`, estado, total.
- **OrderDetails**: ID UUID, relación ManyToOne con `Order` y `Product`, cantidad, precio unitario.

## Registro en `index.ts`

Para inicializar la conexión al arrancar el servidor:

```typescript
import 'reflect-metadata'
import 'dotenv/config'
import express from "express";
import { DataBase } from "./database/db";

const app = express();

async function main() {
    const db = DataBase.getDataBaseInstance();
    await db.init();
}

main();

app.listen(3000, () => console.log('Server is running on port 3000'));
```
