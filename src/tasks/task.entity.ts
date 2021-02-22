import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from './task-status';
import { User } from '../auth/user.entity';

@Entity()
export class Task extends BaseEntity {

	// Todo: Repository Pattern

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column()
	status: TaskStatus;

	@ManyToOne(type => User, user => user.tasks, { eager: false })
	user: User;

	@Column()
	userId: number;
}