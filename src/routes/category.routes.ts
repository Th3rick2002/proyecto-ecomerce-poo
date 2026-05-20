import {Router, Request, Response} from "express";
import {CategoryService} from "../services/category.service";
import {CategoryController} from "../controllers/category.controller";

const categoryRoutes = Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

categoryRoutes.get("/categories", (req: Request, res: Response)=>  categoryController.getAllCategories(req, res));
categoryRoutes.get("/categories/:id", (req: Request, res: Response)=> categoryController.getCategoryById(req, res));
categoryRoutes.post("/categories", (req: Request, res: Response)=> categoryController.createCategory(req, res));
categoryRoutes.put("/categories/:id", (req: Request, res: Response)=> categoryController.updateCategory(req, res));
categoryRoutes.delete("/categories/:id", (req: Request, res: Response)=> categoryController.deleteCategory(req, res));

export default categoryRoutes;
