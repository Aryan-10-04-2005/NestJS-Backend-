import { Module, Global } from '@nestjs/common';
import { UserContextService } from './providers/user-context.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
    providers: [UserContextService, RolesGuard],
    exports: [UserContextService, RolesGuard],
})
export class CommonModule { }
