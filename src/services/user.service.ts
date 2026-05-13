import {User} from "../entities/user.entity";
import {DataBase} from "../database/db";
import {IUser, IUserResponse} from "../interfaces/user.interface";


export class UserService {
    private database = DataBase.getDataBaseInstance();
    private userRepository = this.database.getDataSource().getRepository(User);

    getAllUsers() {
        return this.userRepository.find();
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOneBy({id});

        if (user != null) {
            const response: IUserResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
            }
            return response;
        } else {
            return null;
        }
    }

    createUser(user: IUser) {
        const newUser = new User();
        newUser.name = user.name;
        newUser.email = user.email;
        newUser.password = user.password;

        return this.userRepository.save(newUser);
    }
}