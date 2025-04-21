import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Received request');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const roleId = formData.get('roleId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!roleId) {
      return NextResponse.json(
        { error: 'No role ID provided' },
        { status: 400 }
      );
    }
    
    console.log(`Upload API: Processing file ${file.name} (${file.size} bytes) for role ${roleId}`);
    
    // For demo purposes, we'll just mock a successful upload
    // In a real app, you would upload to Supabase or another storage service
    
    // Create a mock URL based on the file name
    const mockUrl = `https://example.com/uploads/${roleId}/${Date.now()}-${file.name}`;
    
    console.log(`Upload API: File processed successfully, mock URL: ${mockUrl}`);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      url: mockUrl,
      fileName: file.name
    });
    
  } catch (error) {
    console.error('Upload API: Unhandled error', error);
    return NextResponse.json(
      { error: `Unhandled error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 