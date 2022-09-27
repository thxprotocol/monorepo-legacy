import {
  ERC721,
  ERC721Document,
  IERC721Updates,
} from '@thxnetwork/api/models/ERC721';
import {
  ERC721Metadata,
  ERC721MetadataDocument,
} from '@thxnetwork/api/models/ERC721Metadata';
import {
  ERC721TokenState,
  TERC721,
  TERC721Metadata,
  TERC721Token,
} from '@thxnetwork/api/types/TERC721';
import TransactionService from './TransactionService';
import { getProvider } from '@thxnetwork/api/util/network';
import { VERSION, API_URL } from '@thxnetwork/api/config/secrets';
import {
  assertEvent,
  CustomEventLog,
  parseLogs,
} from '@thxnetwork/api/util/events';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ChainId } from '@thxnetwork/api/types/enums';
import {
  getAbiForContractName,
  getByteCodeForContractName,
} from '@thxnetwork/api/config/contracts';
import {
  ERC721Token,
  ERC721TokenDocument,
} from '@thxnetwork/api/models/ERC721Token';
import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { IAccount } from '@thxnetwork/api/models/Account';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import MembershipService from './MembershipService';

async function deploy(data: TERC721): Promise<ERC721Document> {
  const { defaultAccount } = getProvider(data.chainId);
  const abi = getAbiForContractName('NonFungibleToken');
  const bytecode = getByteCodeForContractName('NonFungibleToken');
  data.baseURL = `${API_URL}/${VERSION}/metadata/`;

  const erc721 = new ERC721(data);
  const contract = await TransactionService.deploy(
    abi,
    bytecode,
    [erc721.name, erc721.symbol, erc721.baseURL, defaultAccount],
    erc721.chainId
  );

  erc721.address = contract.options.address;

  return await erc721.save();
}

const initialize = async (pool: AssetPoolDocument, address: string) => {
  const erc721 = await findByQuery({ address, chainId: pool.chainId });
  await addMinter(erc721, pool.address);
  await MembershipService.addERC721Membership(pool.sub, pool);
};

export async function findById(id: string): Promise<ERC721Document> {
  return await ERC721.findById(id);
}

export async function findBySub(sub: string): Promise<ERC721Document[]> {
  return await ERC721.find({ sub });
}

export async function createMetadata(
  erc721: ERC721Document,
  title: string,
  description: string,
  attributes: any
): Promise<ERC721MetadataDocument> {
  return await ERC721Metadata.create({
    erc721: String(erc721._id),
    title,
    description,
    attributes,
  });
}

export async function mint(
  assetPool: AssetPoolDocument,
  erc721: ERC721Document,
  metadata: ERC721MetadataDocument,
  account: IAccount
): Promise<ERC721TokenDocument> {
  const erc721token = new ERC721Token({
    sub: account.id,
    recipient: account.address,
    state: ERC721TokenState.Pending,
    erc721Id: String(erc721._id),
    metadataId: String(metadata._id),
  });

  const callback = async (
    tx: TransactionDocument,
    events?: CustomEventLog[]
  ) => {
    if (events) {
      const event = assertEvent('ERC721Minted', events);
      erc721token.state = ERC721TokenState.Minted;
      erc721token.tokenId = Number(event.args.tokenId);
      erc721token.recipient = event.args.recipient;
    }
    erc721token.transactions.push(String(tx._id));
    return await erc721token.save();
  };

  return await TransactionService.relay(
    assetPool.contract,
    'mintFor',
    [account.address, String(metadata._id)],
    assetPool.chainId,
    callback
  );
}

export async function parseAttributes(entry: ERC721MetadataDocument) {
  const attrs: { [key: string]: string } = {};

  for (const { key, value } of entry.attributes) {
    attrs[key.toLowerCase()] = value;
  }

  return attrs;
}

async function addMinter(erc721: ERC721Document, address: string) {
  const receipt = await TransactionService.send(
    erc721.address,
    erc721.contract.methods.grantRole(
      keccak256(toUtf8Bytes('MINTER_ROLE')),
      address
    ),
    erc721.chainId
  );

  assertEvent(
    'RoleGranted',
    parseLogs(erc721.contract.options.jsonInterface, receipt.logs)
  );
}

async function findTokenById(id: string): Promise<ERC721TokenDocument> {
  return await ERC721Token.findById(id);
}

async function findTokensBySub(sub: string): Promise<ERC721TokenDocument[]> {
  const { address } = await AccountProxy.getById(sub);
  return await ERC721Token.find({ recipient: address });
}

async function findMetadataById(id: string): Promise<ERC721MetadataDocument> {
  return await ERC721Metadata.findById(id);
}

async function findTokensByRecipient(
  recipient: string,
  erc721Id: string
): Promise<TERC721Token[]> {
  const result = [];
  for await (const token of ERC721Token.find({ recipient, erc721Id })) {
    const metadata = await ERC721Metadata.findById(token.metadataId);
    result.push({ ...token.toJSON(), metadata });
  }
  return result as unknown as TERC721Token[];
}

async function findTokensByMetadata(
  metadata: ERC721MetadataDocument
): Promise<TERC721Token[]> {
  return ERC721Token.find({ metadataId: String(metadata._id) });
}

async function findMetadataByNFT(
  erc721: string,
  page = 1,
  limit = 10,
  q?: string
): Promise<any> {
  let query;
  if (q && q != 'null' && q != 'undefined') {
    query = { erc721, title: { $regex: `.*${q}.*`, $options: 'i' } };
  } else {
    query = { erc721 };
  }

  const paginatedResult = await paginatedResults(
    ERC721Metadata,
    page,
    limit,
    query
  );

  const results: TERC721Metadata[] = [];
  for (const metadata of paginatedResult.results) {
    const tokens = (await this.findTokensByMetadata(metadata)).map(
      (m: ERC721MetadataDocument) => m.toJSON()
    );
    results.push({ ...metadata.toJSON(), tokens });
  }
  paginatedResult.results = results;
  return paginatedResult;
}

async function findByPool(assetPool: TAssetPool) {
  return ERC721.findOne({
    poolAddress: assetPool.address,
    address: await assetPool.contract.methods.getERC721().call(),
    chainId: assetPool.chainId,
  });
}

async function findByQuery(query: {
  poolAddress?: string;
  address?: string;
  chainId?: ChainId;
}) {
  return await ERC721.findOne(query);
}

export const update = (erc721: ERC721Document, updates: IERC721Updates) => {
  return ERC721.findByIdAndUpdate(erc721._id, updates, { new: true });
};

export default {
  deploy,
  findById,
  createMetadata,
  mint,
  findBySub,
  findTokenById,
  findTokensByMetadata,
  findTokensBySub,
  findMetadataById,
  findMetadataByNFT,
  findTokensByRecipient,
  findByPool,
  findByQuery,
  addMinter,
  parseAttributes,
  update,
  initialize,
};
