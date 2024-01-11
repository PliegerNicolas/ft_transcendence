import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { CreateUserParams, UpdateUserParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    fetchUsers() {
        return (this.userRepository.find());
    }

    fetchUserById(id: number) {
        //return ( { id, username: '???', email: '???@gmail.com' } );
    }

    createUser(userDetails: CreateUserParams) {
        const newUser = this.userRepository.create({ ...userDetails });
        return (this.userRepository.save(newUser));
    }
    
    updateUser(id: number, updateUserDetails: UpdateUserParams) {
        return (this.userRepository.update({ id }, { ...updateUserDetails }));
    }

    deleteUser(id: number) {
        return (this.userRepository.delete({ id }));
    }

}
