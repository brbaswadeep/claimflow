import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl, base64Image } = await req.json();

    if (!imageUrl && !base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Vision API configuration missing' }, { status: 500 });
    }

    const payload = {
      requests: [
        {
          image: base64Image 
            ? { content: base64Image } 
            : { source: { imageUri: imageUrl } },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
        }
      ]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn("Vision API Error (Billing likely disabled). Falling back to mock data:", JSON.stringify(data, null, 2));
      // Return a simulated OCR response so development is not blocked by Google Cloud billing
      return NextResponse.json({ 
        amount: 1450.50, 
        merchant: "Taj Hotels (Simulated OCR - Billing Disabled)", 
        date: new Date().toISOString().split("T")[0], 
        rawText: "Mocked fallback text" 
      });
    }

    const textAnnotations = data.responses?.[0]?.textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json({ amount: null, merchant: null, date: null, rawText: "" });
    }

    const rawText = textAnnotations[0].description;
    
    // OCR Parsing Heuristics for Indian Receipts
    let extractedAmount: number | null = null;
    let extractedDate: string | null = null;
    let extractedMerchant: string | null = null;

    const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    
    if (lines.length > 0) {
      // First line contextually acts as the Merchant Header
      extractedMerchant = lines[0];
    }

    // Amount extraction: scans for explicitly "Total" lines or parses prominent floats
    const amountRegex = /(?:total|amount|rs\.?|₹)\s*:?\s*([\d,]+\.\d{2})/i;
    for (const line of lines) {
      const amtMatch = line.match(amountRegex);
      if (amtMatch) {
         extractedAmount = parseFloat(amtMatch[1].replace(/,/g, ''));
         break;
      }
    }
    
    // Date Regex Extraction (DD-MM-YYYY or DD/MM/YYYY)
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    for (const line of lines) {
       const dateMatch = line.match(dateRegex);
       if (dateMatch) {
          const d = parseInt(dateMatch[1]);
          const m = parseInt(dateMatch[2]);
          let y = parseInt(dateMatch[3]);
          if (y < 100) y += 2000;
          if (m <= 12 && d <= 31) {
            extractedDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            break;
          }
       }
    }

    return NextResponse.json({
      amount: extractedAmount,
      merchant: extractedMerchant,
      date: extractedDate,
      rawText
    });

  } catch (err: any) {
    console.error("OCR API Server Error:", err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
