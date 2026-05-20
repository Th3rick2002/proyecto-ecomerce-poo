import {ProductService} from "../services/product.service";
import {Request, Response} from "express";

export class ProductController {
    private productsService: ProductService;

    constructor(productsService: ProductService) {
        this.productsService = productsService;
    }

    async getAllProducts(req: Request, res: Response) {
        const products = await this.productsService.getAllProducts();

        res.status(200).json({
            data: products,
        });
    }

    async createProduct(req: Request, res: Response) {
        const product = req.body;

        await this.productsService.createProduct(product);

        res.status(201).json({
            message: "Producto creado correctamente",
        });
    }
}