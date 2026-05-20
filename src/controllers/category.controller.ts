import {Request, Response} from "express";
import {CategoryService} from "../services/category.service";
import {ICreateCategory} from "../interfaces/category.interface";

export class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService;
    }

    async getAllCategories(req: Request, res: Response) {
        const categories = await this.categoryService.getAllCategories();

        res.status(200).json({
            data: categories,
        });
    }

    async getCategoryById(req: Request, res: Response) {
        const { id } = req.params;

        const category = await this.categoryService.getCategoryById(Number(id));

        res.status(200).json({
            data: category,
        })
    }

    async createCategory(req: Request, res: Response) {
        const categoryData: ICreateCategory = req.body;

        await this.categoryService.createCategory(categoryData);

        res.status(201).json({
            message: "Categoría creada correctamente",
        })
    }

    async updateCategory(req: Request, res: Response) {
        const { id } = req.params;
        const categoryData: ICreateCategory = req.body;

        await this.categoryService.updateCategory(Number(id), categoryData);

        res.status(200).json({
            message: "Categoría actualizada correctamente",
        })
    }

    async deleteCategory(req: Request, res: Response) {
        const { id } = req.params;

        await this.categoryService.deleteCategory(Number(id));

        res.status(200).json({
            message: "Categoría eliminada correctamente",
        })
    }
}
