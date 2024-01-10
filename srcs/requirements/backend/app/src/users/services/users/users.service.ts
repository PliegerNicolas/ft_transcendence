import { Injectable } from '@nestjs/common';
import { CreateUserType } from 'src/utils/types';

@Injectable()
export class UsersService {

    private tempUsers = [
        { username: 'Paul', email: 'paul@gmail.com' },
        { username: 'Esteban', email: 'esteban@gmail.com'},
        { username: 'Julie', email: 'julie@gmail.com'},
    ];

    fetchUsers() {
        return (this.tempUsers);
    }

    fetchUserById(id: number) {
        return ( { id, username: '???', email: '???@gmail.com' } );
    }

    createUser(userDetails: CreateUserType) {
        this.tempUsers.push(userDetails);
        return ('New user (' + userDetails.username + ') successfully created');
    }
    
}
