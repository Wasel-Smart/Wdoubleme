import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/heic',
];

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: 'identity' | 'driver_license' | 'vehicle_registration' | 'insurance' | 'profile_photo' | 'other';
  base64Data?: string; // For small files
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: authData, error: userError } = await supabaseUser.auth.getUser();
    const user = authData?.user ?? null;

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { fileName, fileType, fileSize, documentType, base64Data }: UploadRequest =
      await req.json();

    // Validate inputs
    if (!fileName || !fileType || !fileSize || !documentType) {
      throw new Error('Missing required fields: fileName, fileType, fileSize, documentType');
    }

    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      throw new Error(`File type ${fileType} not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    console.log(`Uploading document: ${fileName} (${fileType}, ${fileSize} bytes) for user: ${user.id}`);

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${documentType}/${timestamp}-${sanitizedFileName}`;

    let publicUrl: string;

    if (base64Data) {
      // Upload base64 data
      const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid base64 data format');
      }

      const [, mimeType, base64Content] = base64Match;
      
      // Decode base64
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      publicUrl = urlData.publicUrl;
    } else {
      // Return signed URL for client-side upload
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUploadUrl(filePath);

      if (signedUrlError) {
        throw new Error(`Failed to create upload URL: ${signedUrlError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          uploadUrl: signedUrlData.signedUrl,
          filePath: filePath,
          token: signedUrlData.token,
          message: 'Use this URL to upload your file',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Record document in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        type: documentType,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_path: filePath,
        file_url: publicUrl,
        status: 'uploaded',
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to record document in database:', dbError);
      // Don't fail the upload, just log
    }

    // If this is a verification document, create/update verification record
    if (['identity', 'driver_license', 'vehicle_registration', 'insurance'].includes(documentType)) {
      await supabase
        .from('verifications')
        .upsert({
          user_id: user.id,
          type: documentType,
          status: 'pending',
          document_url: publicUrl,
          submitted_at: new Date().toISOString(),
        });
    }

    // If this is a profile photo, update profile
    if (documentType === 'profile_photo') {
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: {
          id: document?.id,
          url: publicUrl,
          filePath: filePath,
          type: documentType,
          status: 'uploaded',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});