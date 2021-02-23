import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockRepository = () => ({
	findOne: jest.fn()
});

describe('JwtStrategy', () => {

	let jwtStrategy: JwtStrategy;
	let userRepository: jest.Mocked<UserRepository>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				JwtStrategy,
				{ provide: UserRepository, useFactory: mockRepository }
			]
		}).compile();

		jwtStrategy = await module.get(JwtStrategy);
		userRepository = await module.get(UserRepository) as jest.Mocked<UserRepository>;
	});

	describe('validate', () => {

		it('validates and returns the user based on JWT payload', async () => {
			const user = new User();
			user.username = 'TestUser';
			const testUser = { username: 'TestUser' };

			userRepository.findOne.mockResolvedValue(user);
			const result = await jwtStrategy.validate(testUser);
			expect(userRepository.findOne).toHaveBeenCalledWith(testUser);
			expect(result).toEqual(user);
		});

		it('throws an unauthorized exception as user cannot be found', () => {
			userRepository.findOne.mockResolvedValue(null);
			expect(jwtStrategy.validate({ username: 'TestUser' })).rejects.toThrow(UnauthorizedException);
		});
	});
});