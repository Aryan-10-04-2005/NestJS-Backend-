import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { UserContextService } from '../common/providers/user-context.service';

@Injectable({ scope: Scope.REQUEST })
export class ActivityService {
    constructor(
        @InjectRepository(ActivityLog)
        private readonly activityRepository: Repository<ActivityLog>,
        private readonly userContext: UserContextService,
    ) { }

    async log(issueId: number, action: string, oldValue?: string, newValue?: string) {
        const log = this.activityRepository.create({
            issueId,
            action,
            oldValue,
            newValue,
            userId: this.userContext.userId,
            organizationId: this.userContext.organizationId,
        });
        return this.activityRepository.save(log);
    }
}
