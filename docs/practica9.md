## Comandos para instalaciones necesarias

#### Iniciar el proyecto
Crear package.json
```bash
npm init -y
```

Agregar scripts útiles para el proyecto en `package.json`
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

Iniciar repositorio de git
```bash
git init
```

Crear un archivo llamado **.gitignore** en la raíz del proyecto:
```gitignore
/tmp
/out-tsc

/node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
/.pnp
.pnp.js

.DS_Store

.env

/dist

.vscode/*
.idea/
```

#### Instalar dependencias 
```bash
npm install express typeorm reflect-metadata pg dotenv cors class-validator class-transformer
```

#### Instalar dependencias de desarrollo
```bash
npm install -D typescript ts-node-dev @types/node @types/express @types/cors
```

Crear tsconfig.json para el proyecto
```bash
npx tsc --init
```

Reemplazar el contenido de `tsconfig.json` por el siguiente:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",

    "outDir": "./dist",
    "rootDir": "./src",

    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,

    "types": ["node"],
    "lib": ["ES2020"],
    
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "strictPropertyInitialization": false
  },

  "include": ["src"]
}
```

#### Estructura inicial del proyecto
Crear el directorio **src** con la siguiente estructura base:

```
├── src
│   ├── controllers
│   │   └── user.controller.ts
│   ├── database
│   │   └── db.ts
│   ├── entities
│   │   └── user.entity.ts
│   ├── routes
│   │   └── user.route.ts
│   └── services
│   │   └── user.service.ts
│   └── index.ts
├── package.json
├── tsconfig.json
```

En el `index.ts` agregar lo siguiente para probar que las instalaciones y configuraciones funcionen correctamente:

```typescript
import express, { Request, Response} from 'express'

const app = express()

app.get('/', (req: Request, res: Response) => res.send('Hello World!'))

app.listen(3000, () => console.log('Server is running on port 3000'));
```

Para levantar el servidor ejecutar: `npm run dev`

Y en el navegador ingresar [localhost:3000](http://localhost:3000)

#### Comandos de Build y Ejecución
`npm run build` - Compila el proyecto a JS en la carpeta `dist/`.

`npm run start` - Ejecuta el proyecto compilado.
