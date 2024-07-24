import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { NotFoundError } from 'rxjs';

const scrypt = promisify(_scrypt); //turning the cb output into promise

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // Hash the users password
    // Generate a salt
    const salt = randomBytes(8).toString('hex'); // the salt will have 16 chars

    // Hash the password with salt
    const hash = (await scrypt(password, salt, 32)) as Buffer; // the hash will have 32 chars
    //the 'as Buffer' part is to help TS to have some type-safety

    //Join the hashed result with salt
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, result);

    // return the user (if an error is not returned in previous steps)
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email); //the find method returns an array
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.'); // getting hashed password from DB
    // console.log(salt);
    // console.log(storedHash);

    const hash = (await scrypt(password, salt, 32)) as Buffer; // hashing input's password

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
