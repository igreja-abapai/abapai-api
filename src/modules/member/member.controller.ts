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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

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
    findAll() {
        return this.memberService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.memberService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @Request() req) {
        const userId = req.user.id;
        return this.memberService.update(+id, updateMemberDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.memberService.remove(+id);
    }
}
