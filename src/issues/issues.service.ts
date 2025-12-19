import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { UserContextService } from '../common/providers/user-context.service';
import { ActivityService } from '../activity/activity.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
    constructor(
        @InjectRepository(Issue)
        private readonly issueRepository: Repository<Issue>,
        private readonly userContext: UserContextService,
        private readonly activityService: ActivityService,
    ) { }

    async create(createIssueDto: CreateIssueDto) {
        const issue = this.issueRepository.create({
            ...createIssueDto,
            organizationId: this.userContext.organizationId,
        });
        return this.issueRepository.save(issue);
    }

    async findAll() {
        return this.issueRepository.find({
            where: { organizationId: this.userContext.organizationId },
        });
    }

    async findOne(id: number) {
        const issue = await this.issueRepository.findOne({
            where: { id, organizationId: this.userContext.organizationId },
        });
        if (!issue) {
            throw new NotFoundException(`Issue #${id} not found`);
        }
        return issue;
    }

    async update(id: number, updateIssueDto: UpdateIssueDto) {
        const issue = await this.findOne(id);

        // RBAC Check for Status/Assignee
        if (this.userContext.role !== 'ADMIN') {
            if (updateIssueDto.status || updateIssueDto.assignee) {
                throw new ForbiddenException('Only ADMIN can update status or assignee');
            }
        }

        // Activity Logging
        if (updateIssueDto.status && updateIssueDto.status !== issue.status) {
            await this.activityService.log(id, 'STATUS_CHANGE', issue.status, updateIssueDto.status);
        }
        if (updateIssueDto.assignee && updateIssueDto.assignee !== issue.assignee) {
            await this.activityService.log(id, 'ASSIGNMENT_CHANGE', issue.assignee, updateIssueDto.assignee);
        }

        Object.assign(issue, updateIssueDto);
        return this.issueRepository.save(issue);
    }

    async remove(id: number) {
        if (this.userContext.role !== 'ADMIN') {
            throw new ForbiddenException('Only ADMIN can delete issues');
        }
        const issue = await this.findOne(id);
        return this.issueRepository.remove(issue);
    }
}
