import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateIssueDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    assignee?: string;
}
