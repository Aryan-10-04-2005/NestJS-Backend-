import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
    organizationId: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';

    setUserContext(organizationId: string, userId: string, role: 'ADMIN' | 'MEMBER') {
        this.organizationId = organizationId;
        this.userId = userId;
        this.role = role;
    }
}
