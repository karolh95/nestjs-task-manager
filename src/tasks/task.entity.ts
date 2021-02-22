import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from './task-status';

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
}