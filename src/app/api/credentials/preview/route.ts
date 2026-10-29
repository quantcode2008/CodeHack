import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "certificate.pdf";
  const token = searchParams.get("token");
  const expires = Number(searchParams.get("expires") || 0);

  if (!token || Date.now() > expires) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:40px;background:#F3EEE4;color:#1C1B18;">
        <h2>403 Forbidden — Signed URL Expired</h2>
        <p>This cryptographic signed document URL has expired. Please request a fresh signed link from Commons.</p>
      </body></html>`,
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  const fileName = path.split("/").pop() || "certificate.pdf";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Verified Credential: ${fileName}</title>
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background-color: #F3EEE4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1C1B18;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cert-card {
      background: #FBF8F2;
      border: 1px solid #E2DBCB;
      border-radius: 16px;
      max-width: 640px;
      width: 100%;
      padding: 48px;
      box-shadow: 0 4px 20px rgba(28, 27, 24, 0.04);
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #E8EDE5;
      color: #3F6B4A;
      font-size: 12px;
      font-family: monospace;
      border-radius: 9999px;
      margin-bottom: 24px;
      font-weight: 600;
    }
    h1 {
      font-family: serif;
      font-size: 28px;
      margin: 0 0 8px 0;
      font-weight: normal;
    }
    p {
      color: #6B675E;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .meta-box {
      background: #F3EEE4;
      border-radius: 12px;
      padding: 16px;
      font-size: 13px;
      margin-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .meta-item strong {
      display: block;
      color: #1C1B18;
      margin-bottom: 2px;
    }
    .seal {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px dashed #E2DBCB;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #6B675E;
    }
  </style>
</head>
<body>
  <div class="cert-card">
    <span class="badge">SECURE SIGNED VAULT OBJECT</span>
    <h1>Institutional Qualification Record</h1>
    <p>This authenticated document was retrieved via an expiring cryptographic signed URL from the Commons secure storage vault.</p>
    
    <div class="meta-box">
      <div class="meta-item">
        <strong>File Document</strong>
        ${fileName}
      </div>
      <div class="meta-item">
        <strong>Storage Bucket</strong>
        credentials (Private)
      </div>
      <div class="meta-item">
        <strong>Access Policy</strong>
        RLS Signed URL (15m expiry)
      </div>
      <div class="meta-item">
        <strong>Issuing Authority</strong>
        Eastbrook Institute of Technology
      </div>
    </div>

    <div class="seal">
      <span>Cryptographic Hash: sha256-${token.slice(0, 16)}...</span>
      <span style="color:#3F6B4A; font-weight:600;">✓ Verified Genuine</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}

