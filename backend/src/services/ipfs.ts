import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001' });

export async function uploadToIPFS(file: Buffer): Promise<string> {
  const result = await ipfs.add(file);
  return result.cid.toString();
}

export async function getFromIPFS(cid: string): Promise<Uint8Array> {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks));
}
