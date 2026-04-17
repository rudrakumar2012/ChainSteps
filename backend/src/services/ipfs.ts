import { create } from 'ipfs-http-client';

// Create IPFS client lazily to avoid ESM import issues
let ipfsClient: Awaited<ReturnType<typeof create>> | null = null;

async function getIpfsClient() {
  if (!ipfsClient) {
    ipfsClient = create({ url: 'https://ipfs.infura.io:5001' });
  }
  return ipfsClient;
}

export async function uploadToIPFS(file: Buffer): Promise<string> {
  const ipfs = await getIpfsClient();
  const result = await ipfs.add(file);
  return result.cid.toString();
}

export async function getFromIPFS(cid: string): Promise<Uint8Array> {
  const ipfs = await getIpfsClient();
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks));
}
