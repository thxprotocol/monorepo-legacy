import mongoose from 'mongoose';

export type InvoiceDocument = mongoose.Document & TInvoice;

export const Invoice = mongoose.model<InvoiceDocument>(
    'Invoice',
    new mongoose.Schema(
        {
            poolId: String,
            additionalUnitCount: Number,
            costPerUnit: Number,
            costSubscription: Number,
            costTotal: Number,
            currency: String,
            plan: Number,
            mapCount: Number,
            mapLimit: Number,
            periodStartDate: Date,
            periodEndDate: Date,
        },
        { timestamps: true },
    ),
    'invoice',
);
