import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export async function POST(req: NextRequest) {
  if (!PINATA_JWT) {
    return NextResponse.json({ error: "PINATA_JWT not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    const pinataForm = new FormData();
    pinataForm.append("file", blob, file.name);
    pinataForm.append("pinataMetadata", JSON.stringify({ name: file.name }));
    pinataForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: pinataForm,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Pinata error: ${err.slice(0, 100)}` }, { status: 502 });
    }

    const data = await res.json();
    const url = `${IPFS_GATEWAY}/${data.IpfsHash}`;
    return NextResponse.json({ url, cid: data.IpfsHash });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
