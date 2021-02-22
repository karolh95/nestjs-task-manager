import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task-status';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {

	private logger = new Logger('TaskController');

	constructor(private tasksService: TasksService) { }

	@Get()
	getTasks(
		@Query(ValidationPipe) filterDto: GetTasksFilterDto,
		@GetUser() user: User
	): Promise<Task[]> {
		this.logger.verbose(`User ${user.username} retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
		return this.tasksService.getTasks(filterDto, user);
	}

	@Get(':id')
	getTaskById(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User
	): Promise<Task> {
		return this.tasksService.getTaskById(id, user);
	}

	@Post()
	@UsePipes(ValidationPipe)
	createTask(
		@Body() createTaskDto: CreateTaskDto,
		@GetUser() user: User
	): Promise<Task> {
		this.logger.verbose(`User ${user.username} creating a new this.tasksService. Data: ${JSON.stringify(createTaskDto)}`);
		return this.tasksService.createTeask(createTaskDto, user);
	}

	@Patch(':id/status')
	updateTaskStatus(
		@Param('id', ParseIntPipe) id: number,
		@Body('status', TaskStatusValidationPipe) status: TaskStatus,
		@GetUser() user: User
	): Promise<Task> {
		return this.tasksService.updateTaskStatus(id, status, user);
	}

	@Delete(':id')
	deleteTask(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User
	): Promise<void> {
		return this.tasksService.deleteTask(id, user);
	}
}
