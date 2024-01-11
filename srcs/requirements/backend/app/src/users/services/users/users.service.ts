import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { CreateUserParams, UpdateUserParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async fetchUsers(): Promise<User[]> {
        return (this.userRepository.find());
    }

    async fetchUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: {  id }});
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return (user);
    }

    async createUser(userDetails: CreateUserParams): Promise<User> {
        const newUser = this.userRepository.create({ ...userDetails });
        return (this.userRepository.save(newUser));
    }
    
    async updateUser(id: number, updateUserDetails: UpdateUserParams): Promise<void> {
        const updateResult = await this.userRepository.update(id, updateUserDetails);
        if (updateResult.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
    }

    async deleteUser(id: number): Promise<void> {
        const deleteResult = await this.userRepository.delete(id);
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
    }

}
