import axios from 'axios';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';
import { logger } from '../util/logger';
import { BadRequestError } from '../util/errors';
import {
    ChainCallDTO,
    TokenInstance,
    TokenClassKey,
    TokenInstanceKey,
    createValidDTO,
    CreateTokenClassDto,
    GalaChainResponse,
    GetMyProfileDto,
    MintTokenDto,
    GrantAllowanceDto,
    AllowanceType,
    FetchBalancesDto,
    TransferTokenDto,
    RegisterUserDto,
} from '@gala-chain/api';
import { GalachainRole, getClient } from '../util/galachain';
import { Wallet } from 'ethers';
import { NODE_ENV } from '../config/secrets';

const GALACHAIN_URL = 'https://gateway.stage.galachain.com/api';
const identityKey = (address: string) => `eth|${address.replace(/^0x/, '')}`;

export default class GalachainService {
    static evaluateTransaction(
        methodName: string,
        contract: TGalachainContract,
        dto: ChainCallDTO,
        privateKey: string,
    ) {
        const methodMap = {
            development: this.evaluateTransactionLocal.bind(this),
            production: this.submitTransactonREST.bind(this),
        };
        return methodMap[NODE_ENV](methodName, contract, dto, privateKey);
    }

    static submitTransaction(methodName: string, contract: TGalachainContract, dto: ChainCallDTO, privateKey: string) {
        const methodMap = {
            development: this.submitTransactionLocal.bind(this),
            production: this.submitTransactonREST.bind(this),
        };
        return methodMap[NODE_ENV](methodName, contract, dto, privateKey);
    }

    static async evaluateTransactionLocal(
        methodName: string,
        contract: TGalachainContract,
        dto: ChainCallDTO,
        privateKey: string,
    ) {
        const client = getClient(GalachainRole.Curator); // TODO Make this dynamic
        const response = await client.forContract(contract).evaluateTransaction(methodName, dto.signed(privateKey));

        if (GalaChainResponse.isError(response)) {
            throw new Error(`${response.Message} (${response.ErrorKey})`);
        } else {
            return response.Data;
        }
    }

    static async submitTransactionLocal(
        methodName: string,
        contract: TGalachainContract,
        dto: ChainCallDTO,
        privateKey: string,
    ) {
        const client = getClient(GalachainRole.Curator); // TODO Make this dynamic
        const response = await client.forContract(contract).submitTransaction(methodName, dto.signed(privateKey));

        if (GalaChainResponse.isError(response)) {
            throw new BadRequestError(`${response.Message} (${response.ErrorKey})`);
        } else {
            return response.Data;
        }
    }

    static async submitTransactonREST(
        methodName: string,
        contract: TGalachainContract,
        dto: ChainCallDTO,
        privateKey: string,
    ) {
        const signedDto = dto.signed(privateKey);
        const url = new URL(GALACHAIN_URL);
        url.pathname = `${url.pathname}/${contract.channelName}/${contract.chaincodeName}-${contract.contractName}/${methodName}`;

        try {
            const res = await axios({
                method: 'POST',
                url: url.toString(),
                headers: {},
                data: instanceToPlain(signedDto),
            });
            return res.data;
        } catch (error) {
            logger.error(error.response.data);
            throw new BadRequestError(error.response.data.message);
        }
    }

    static getProfile(contract: TGalachainContract, privateKey: string) {
        const dto = new GetMyProfileDto().signed(privateKey, false);
        return this.evaluateTransaction('GetMyProfile', contract, dto, privateKey);
    }

    static registerUser(contract: TGalachainContract, publicKey: string, privateKey: string) {
        const dto = new RegisterUserDto();
        dto.publicKey = publicKey;
        dto.sign(privateKey, false);

        return this.submitTransaction('RegisterEthUser', contract, dto, privateKey);
    }

    static async balanceOf(contract: TGalachainContract, tokenClassKey: TGalachainToken, privateKey: string) {
        const tokenClass = plainToInstance(TokenInstanceKey, tokenClassKey);
        const owner = new Wallet(privateKey).address;
        const dto = await createValidDTO(FetchBalancesDto, {
            owner: identityKey(owner),
            ...tokenClass,
        });
        return this.evaluateTransaction('FetchBalances', contract, dto, privateKey);
    }

    static async create(
        contract: TGalachainContract,
        tokenInfo: {
            image: string;
            name: string;
            description: string;
            symbol: string;
            decimals: number;
            maxSupply: any;
        },
        tokenClassKey: TGalachainToken,
        privateKey: string,
    ) {
        const tokenClass = plainToInstance(TokenClassKey, tokenClassKey);
        const dto = await createValidDTO<CreateTokenClassDto>(CreateTokenClassDto, {
            tokenClass,
            ...tokenInfo,
        });

        return this.submitTransaction('CreateTokenClass', contract, dto, privateKey);
    }

    static async mint(
        contract: TGalachainContract,
        tokenClassKey: TGalachainToken,
        to: string,
        amount: number,
        privateKey: string,
    ) {
        const tokenClass = plainToInstance(TokenClassKey, tokenClassKey);
        const dto = await createValidDTO<MintTokenDto>(MintTokenDto, {
            owner: identityKey(to),
            tokenClass,
            quantity: new BigNumber(amount) as any,
        });

        return this.submitTransaction('MintToken', contract, dto, privateKey);
    }

    static async approve(
        contract: TGalachainContract,
        tokenClassKey: TGalachainToken,
        spender: string,
        amount: number,
        allowanceType: AllowanceType,
        privateKey: string,
    ) {
        const dto = await createValidDTO<GrantAllowanceDto>(GrantAllowanceDto, {
            tokenInstance: TokenInstanceKey.nftKey(tokenClassKey, TokenInstance.FUNGIBLE_TOKEN_INSTANCE).toQueryKey(),
            allowanceType,
            quantities: [{ user: identityKey(spender), quantity: new BigNumber(amount) as any }],
            uses: new BigNumber(amount) as any,
        });

        return this.submitTransaction('GrantAllowance', contract, dto, privateKey);
    }

    static async transfer(
        contract: TGalachainContract,
        tokenClassKey: TGalachainToken,
        to: string,
        amount: number,
        instance: BigNumber,
        privateKey: string,
    ) {
        const tokenInstance = plainToInstance(TokenInstanceKey, { ...tokenClassKey, instance });
        const dto = await createValidDTO(TransferTokenDto, {
            from: identityKey(new Wallet(privateKey).address),
            to: identityKey(to),
            tokenInstance,
            quantity: new BigNumber(amount) as any,
        });

        return this.submitTransaction('TransferToken', contract, dto, privateKey);
    }
}
