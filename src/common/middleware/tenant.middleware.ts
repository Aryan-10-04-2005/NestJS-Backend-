import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserContextService } from '../providers/user-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly userContextService: UserContextService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const orgId = req.headers['x-org-id'] as string;
        const userId = req.headers['x-user-id'] as string;
        const role = req.headers['x-user-role'] as 'ADMIN' | 'MEMBER';

        if (!orgId) {
            throw new UnauthorizedException('Organization ID is missing');
        }
        if (!userId) {
            throw new UnauthorizedException('User ID is missing');
        }
        if (!role || !['ADMIN', 'MEMBER'].includes(role)) {
            throw new UnauthorizedException('Invalid or missing User Role');
        }

        this.userContextService.setUserContext(orgId, userId, role);
        next();
    }
}
