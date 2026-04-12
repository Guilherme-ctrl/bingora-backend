import type { CurrentOrganizerPayload } from '../organizers/current-organizer.decorator';
import { FinanceService } from './finance.service';
export declare class EventFinanceController {
    private readonly finance;
    constructor(finance: FinanceService);
    summary(user: CurrentOrganizerPayload, eventId: string): Promise<import("./finance.service").EventFinancialSummary>;
}
