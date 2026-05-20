import {User} from "../entities/user.entity";
import {DataBase} from "../database/db";
import {IUser, IUserResponse} from "../interfaces/user.interface";
import {Not} from "typeorm";
import {ConflictError, NotFoundError} from "../middlewares/error.middleware";


export class UserService {
    private database = DataBase.getDataBaseInstance();
    private userRepository = this.database.getDataSource().getRepository(User);

    getAllUsers() {
        return this.userRepository.find();
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOneBy({id});

        if (user == null) throw new NotFoundError("User not found");

        const response: IUserResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
        }
        return response;
    }

    async createUser(user: IUser) {
        const existUserEmail = await this.userRepository.findOneBy({email: user.email});

        if (existUserEmail != null) throw new ConflictError("Email already exists");

        const newUser = new User();
        newUser.name = user.name;
        newUser.email = user.email;
        newUser.password = user.password;

        return this.userRepository.save(newUser);
    }

    async updateUser(id: string, user: Partial<IUser>) {
        const userExist = await this.userRepository.findOneBy({id: id})

        if (userExist == null) throw new NotFoundError("User not found");

        const existUserEmail = await this.userRepository.findOne({
            where: {
                email: user.email,
                id: Not(id)
            },
        });

        if (existUserEmail != null) throw new ConflictError("Email already exists");

        user.name ? userExist.name = user.name : null;
        user.email ? userExist.email = user.email : null;
        user.password ? userExist.password = user.password : null;

        await this.userRepository.save(userExist);
    }

    async deleteUser(id: string) {
        const userExist = await this.userRepository.findOneBy({id})

        if (userExist == null) throw new NotFoundError("User not found");

        await this.userRepository.remove(userExist);
    }
}