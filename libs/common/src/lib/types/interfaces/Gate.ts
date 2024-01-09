import { GateVariant } from '../enums';
import { TPaginationResult } from '../interfaces';

export type TGate = {
    _id: string;
    poolId: string;
    variant: GateVariant;
    title: string;
    description: string;
    amount: number;
    score: number;
    contractAddress: string;
};

export type TGateListResponse = {
    results: TGate[];
} & TPaginationResult;

export type TGateState = {
    [poolId: string]: TGateListResponse;
};
