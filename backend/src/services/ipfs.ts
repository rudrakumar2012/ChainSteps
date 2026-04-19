// IPFS upload via Pinata API
// Set PINATA_JWT in .env for authentication.
// Falls back to a public gateway for read operations.

const PINATA_API = 'https://api.pinata.cloud';

function getPinataJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error('PINATA_JWT environment variable is required for IPFS uploads. Get one at https://pinata.cloud');
  }
  return jwt;
}

export async function uploadToIPFS(file: Buffer): Promise<string> {
  const jwt = getPinataJwt();

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(file)]), 'evidence');

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { IpfsHash: string };
  return data.IpfsHash;
}

export async function getFromIPFS(cid: string): Promise<Uint8Array> {
  const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!res.ok) {
    throw new Error(`IPFS fetch failed (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return new Uint8Array(buffer);
}