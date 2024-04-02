import InvoiceService from '@thxnetwork/api/services/InvoiceService';
import { startOfMonth, endOfMonth, addHours, subMonths } from 'date-fns';

export default async function main() {
    const currentDate = subMonths(new Date(), 0);
    const invoicePeriodstartDate = startOfMonth(currentDate);
    const invoicePeriodEndDate = endOfMonth(currentDate);

    // Account for UTC + 2 timezone offset
    const offset = 2;

    await InvoiceService.upsertInvoices(
        addHours(invoicePeriodstartDate, offset),
        addHours(invoicePeriodEndDate, offset),
    );
}
