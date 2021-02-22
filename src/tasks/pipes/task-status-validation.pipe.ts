import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { TaskStatus } from '../task-status';

export class TaskStatusValidationPipe implements PipeTransform {

	transform(status: any, metadata: ArgumentMetadata) {

		if (!this.isValid(status))
			throw new BadRequestException(`"${status}" is an invalid status`);

		return status;
	}

	private isValid(status: any): boolean {
		return Object.values(TaskStatus).includes(status);
	}

}