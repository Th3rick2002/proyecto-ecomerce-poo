import {Category} from "../entities/category.entity";
import {DataBase} from "../database/db";
import {ICreateCategory} from "../interfaces/category.interface";
import {ConflictError, NotFoundError} from "../middlewares/error.middleware";

export class CategoryService {
    private database = DataBase.getDataBaseInstance();
    private categoryRepository = this.database.getDataSource().getRepository(Category);

    getAllCategories() {
        return this.categoryRepository.find();
    }

    async getCategoryById(id: number) {
        const category = await this.categoryRepository.findOneBy({id});

        if (category == null) throw new NotFoundError("Category not found");

        return category;
    }

    async createCategory(categoryData: ICreateCategory) {
        const existCategory = await this.categoryRepository.findOneBy({name: categoryData.name});

        if (existCategory != null) throw new ConflictError("Category already exists");

        const newCategory = new Category();
        newCategory.name = categoryData.name;

        return this.categoryRepository.save(newCategory);
    }

    async updateCategory(id: number, categoryData: Partial<ICreateCategory>) {
        const categoryExist = await this.categoryRepository.findOneBy({id})

        if (categoryExist == null) throw new NotFoundError("Category not found");

        categoryData.name ? categoryExist.name = categoryData.name : null;

        await this.categoryRepository.save(categoryExist);
    }

    async deleteCategory(id: number) {
        const categoryExist = await this.categoryRepository.findOneBy({id})

        if (categoryExist == null) throw new NotFoundError("Category not found");

        await this.categoryRepository.remove(categoryExist);
    }
}
