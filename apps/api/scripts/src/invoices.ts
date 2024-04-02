import InvoiceService from '@thxnetwork/api/services/InvoiceService';
import { startOfMonth, endOfMonth, addHours } from 'date-fns';

export default async function main() {
    const currentDate = new Date();
    const invoicePeriodstartDate = startOfMonth(currentDate);
    const invoicePeriodEndDate = endOfMonth(currentDate);
    console.log(invoicePeriodstartDate, invoicePeriodEndDate);

    // Account for UTC + 2 timezone offset
    const offset = 2;

    console.log(addHours(invoicePeriodstartDate, offset), addHours(invoicePeriodEndDate, offset));
    // await InvoiceService.upsertInvoices(
    //     addHours(invoicePeriodstartDate, offset),
    //     addHours(invoicePeriodEndDate, offset),
    // );
}
