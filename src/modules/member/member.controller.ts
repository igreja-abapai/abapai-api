import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
    UseGuards,
    Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpsertMemberDiscipleshipDto } from './dto/upsert-member-discipleship.dto';
import { UpdateMemberDiscipleshipCaseDto } from './dto/update-member-discipleship-case.dto';

@Controller('member')
@UseGuards(AuthGuard('jwt'))
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Post()
    create(@Body() createMemberDto: CreateMemberDto, @Request() req) {
        const userId = req.user.id;
        return this.memberService.create(createMemberDto, userId);
    }

    @Get()
    findAll(@Query() query: PaginationQueryDto) {
        return this.memberService.findAll(query);
    }

    @Get(':id/discipleship-cases')
    getDiscipleshipCases(@Param('id') id: string) {
        return this.memberService.getDiscipleshipCases(+id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.memberService.findOne(+id);
    }

    @Patch(':id/restore')
    restore(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.memberService.restore(+id, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @Request() req) {
        const userId = req.user.id;
        return this.memberService.update(+id, updateMemberDto, userId);
    }

    @Patch(':id/discipleship')
    upsertDiscipleship(
        @Param('id') id: string,
        @Body() dto: UpsertMemberDiscipleshipDto,
        @Request() req,
    ) {
        const userId = req.user.id;
        return this.memberService.upsertDiscipleship(+id, dto, userId);
    }

    @Patch(':id/discipleship-cases/:caseId')
    updateDiscipleshipCase(
        @Param('id') id: string,
        @Param('caseId') caseId: string,
        @Body() dto: UpdateMemberDiscipleshipCaseDto,
        @Request() req,
    ) {
        const userId = req.user.id;
        return this.memberService.updateDiscipleshipCase(+id, +caseId, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.memberService.remove(+id, userId);
    }
}
