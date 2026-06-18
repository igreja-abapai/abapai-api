import { ServiceAssignment } from '../entities/service-assignment.entity';

export function isServiceAssignmentFilled(assignment: ServiceAssignment): boolean {
    return Boolean(
        assignment.memberId ||
            assignment.servingGroupId ||
            (assignment.guestName && assignment.guestName.trim()),
    );
}

export function normalizeGuestName(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}
