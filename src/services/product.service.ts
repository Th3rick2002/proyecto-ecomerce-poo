import {DataBase} from "../database/db";
import {Product} from "../entities/product.entity";
import {IProduct, IProductResponse} from "../interfaces/Product.interface";
import {Category} from "../entities/category.entity";
import {NotFoundError} from "../middlewares/error.middleware";

export class ProductService {
    private database = DataBase.getDataBaseInstance();
    private categoryRepository = this.database.getDataSource().getRepository(Category);
    private productRepository = this.database.getDataSource().getRepository(Product);

    async getAllProducts() {
        const products = await this.productRepository.find({
            relations: ['category']
        });

        const response: IProductResponse[] = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            categoryId: product.category.id,
            category: product.category.name
        }))

        return response;
    }

    async createProduct(product: IProduct) {

        const categoryExist = await this.categoryRepository.findOneBy({
            id: product.categoryId
        });

        if (categoryExist == null) throw new NotFoundError("Category not found");

        const newProduct = new Product();
        newProduct.name = product.name;
        newProduct.price = product.price;
        newProduct.stock = product.stock;
        newProduct.category = categoryExist;

        return this.productRepository.save(newProduct);
    }
}