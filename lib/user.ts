import { createUser, findUser } from "@/services/user";
import { type role } from "@/types/user";
import { errorHandle } from "./decorators";



class User {

    /**
     * Finds a user by their email address.
     * @param email The email address to search for.
     * @param callback A callback function that will be called with the user object if found, or null otherwise.
     */
    @errorHandle("Correo ya registrado", 404)
    async findUser(email: string) {
        const user = await findUser(email);
        if (user) {
            return user;
        }
    } 

    /**
     * Creates a new user and their credentials account in a transaction.
     * @param email The email address of the user.
     * @param name The name of the user.
     * @param surname The surname of the user.
     * @param role The role of the user.
     * @param password The password of the user.
     */
    @errorHandle("Error al crear el usuario", 500)
    async createUser(email: string, name: string, surname: string, role: role, password: string) {
        await createUser(email, name, surname, role, password);
    }
    
    
}

export default User;
