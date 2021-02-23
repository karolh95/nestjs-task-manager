import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentials = {
  username: 'TestUsername',
  password: 'TestPassword'
} as AuthCredentialsDto;

describe('userRepository', () => {

  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository
      ]
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  })

  describe('signUp', () => {

    let save: jest.Mock<any, any>;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('succesfully signs up the user', async () => {
      save.mockResolvedValue(undefined);
      await expect(userRepository.signUp(mockCredentials)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });
      await expect(userRepository.signUp(mockCredentials)).rejects.toThrow(ConflictException);
    });

    it('throws an exception', async () => {
      save.mockRejectedValue({ code: '23500' });
      await expect(userRepository.signUp(mockCredentials)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUserPassword', () => {

    let user: User;
    let findOne: jest.Mock<any, any>;
    let validatePassword: jest.Mock<any, any>;

    beforeEach(() => {

      user = new User();
      user.username = 'TestUsername';

      user.validatePassword = validatePassword = jest.fn();
      userRepository.findOne = findOne = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      findOne.mockResolvedValue(user);
      validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockCredentials);
      expect(result).toEqual(user.username);
    });

    it('returns null as user cannot be found', async () => {
      findOne.mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(mockCredentials);
      expect(validatePassword).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('returns null as password is invalid', async () => {
      findOne.mockResolvedValue(user);
      validatePassword.mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(mockCredentials);
      expect(result).toEqual(null);
    });
  });
});