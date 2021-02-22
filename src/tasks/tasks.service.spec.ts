import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status';
import { User } from '../auth/user.entity';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn()
});

const mockUser = {
  id: 12,
  username: 'test user'
} as User;

describe('TaskService', () => {

  let tasksService: TasksService;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository }
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await (module.get<TaskRepository>(TaskRepository) as jest.Mocked<TaskRepository>);
  });

  describe('getTasks', () => {
    it('get all tasks from the repository', async () => {
      taskRepository.getTasks
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query'
      };

      tasksService.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
    });
  })

  describe('get task by id', () => {
    it('calls taskRepository.findOne() and success', async () => {

      const task = {
        title: 'Test task',
        description: 'Test desc'
      } as Task;

      taskRepository.findOne.mockResolvedValue(task);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(task);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id
        }
      });
    });

    it('calls taskRepository.findOne() and fail', () => {

      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create task', () => {

    it('calls taskRepository.create() and return the result', async () => {

      const createdTask = {
        id: 1,
        title: 'New Task',
        description: 'Already created task',
        status: TaskStatus.OPEN
      } as Task;
      taskRepository.createTask.mockResolvedValue(createdTask);

      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const task = {
        title: 'Task title',
        description: 'Task desc'
      } as Task;
      const result = await tasksService.createTeask(task, mockUser);

      expect(taskRepository.createTask).toBeCalledWith(task, mockUser);
      expect(result).toEqual(createdTask);
    });
  })

  describe('delete task', () => {
    it('calls taskRepository.deleteTask() to delete a task', async () => {

      taskRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
    });

    it('throws an error as task could nnot be found', () => {

      taskRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
    })
  });

  describe('updateTaskStatus', () => {
    it('update task status', async () => {

      const save = jest.fn().mockResolvedValue(true);

      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save: save
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});