import {Router, Request, Response} from "express";
import {ProductService} from "../services/product.service";
import {ProductController} from "../controllers/product.controller";


const productRoutes = Router();

const productService = new ProductService();
const productController = new ProductController(productService);

productRoutes.get('/products', (req: Request, res: Response) => productController.getAllProducts(req, res))

productRoutes.post('/products', (req: Request, res: Response) => productController.createProduct(req, res))

export default productRoutes;