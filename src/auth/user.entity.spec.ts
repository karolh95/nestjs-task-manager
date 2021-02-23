import * as bcrypt from 'bcrypt';
import { async } from 'rxjs';
import { User } from './user.entity';

describe('User entity', () => {

	let user: User;
	const hash = jest.spyOn(bcrypt, 'hash');

	beforeEach(() => {
		user = new User();
		user.password = 'testPassword';
		user.salt == 'testSalt';
	});

	afterEach(() => {
		hash.mockClear();
	});

	describe('validatePassword', () => {

		it('returns true as password is valid', async () => {
			hash.mockReturnValue(Promise.resolve('testPassword'));
			expect(hash).not.toHaveBeenCalled();
			const password = '123456';
			const result = await user.validatePassword(password);
			expect(hash).toHaveBeenCalledWith(password, user.salt);
			expect(result).toEqual(true);
		});

		it('returns false as password is invlaid', async () => {
			hash.mockReturnValue(Promise.resolve('wrongPassword'));
			expect(hash).not.toHaveBeenCalled();
			const result = await user.validatePassword('wrongPassword');
			expect(hash).toHaveBeenCalledWith('wrongPassword', user.salt);
			expect(result).toEqual(false);
		});
	});
});