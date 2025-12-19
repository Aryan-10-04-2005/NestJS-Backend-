import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserContextService } from '../providers/user-context.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly userContextService: UserContextService,
    ) {
        console.log('RolesGuard created', { reflector: !!this.reflector, userContext: !!this.userContextService });
    }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const userRole = this.userContextService.role;
        if (!roles.includes(userRole)) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return true;
    }
}
