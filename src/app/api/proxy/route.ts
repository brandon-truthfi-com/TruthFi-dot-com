import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const requestBody = await req.json();

    // Add your Playfair API key (use environment variables to keep it secure)
    const API_KEY = process.env.NEXT_PUBLIC_PLAYFAIR_API_KEY; // Use a secure environment variable (not NEXT_PUBLIC)

    // Make the request to the Playfair API
    const response = await fetch('http://api.playfairapp.com/top-accounts-feed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`, // Secure API key
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-200 responses from the Playfair API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Playfair API error: ${response.status} - ${errorText}`);
      throw new Error(`Playfair API returned an error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();

    // Validate the structure of the response data
    if (!responseData.data || !Array.isArray(responseData.data)) {
      console.error('Invalid data structure received from Playfair API:', responseData);
      throw new Error('Invalid response format from Playfair API');
    }

    // Log the validated response for debugging
    console.log('Validated Playfair API Response:', responseData);

    // Return only the necessary data to the client
    return NextResponse.json({ data: responseData.data }); // Ensure `data` is always an array
  } catch (error) {
    // Handle errors gracefully and log them
    console.error('Proxy route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
