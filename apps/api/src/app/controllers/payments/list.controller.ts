import { Request, Response } from 'express';
import PaymentService from '@thxnetwork/api/services/PaymentService';
import { PaymentDocument } from '@thxnetwork/api/models/Payment';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Payments']
    const payments = await PaymentService.findByPool(req.assetPool);

    res.json(
        payments.map((payment: PaymentDocument) => {
            const paymentUrl = PaymentService.getPaymentUrl(payment._id, payment.token);

            return { ...payment.toJSON(), paymentUrl };
        }),
    );
};

export default { controller };
