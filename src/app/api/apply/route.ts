import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const roleId = formData.get('roleId')?.toString()
    const name = formData.get('name')?.toString()
    const email = formData.get('email')?.toString()
    const phone = formData.get('phone')?.toString()
    const coverLetter = formData.get('coverLetter')?.toString() || ''
    const resume = formData.get('resume') as File | null

    // Validate required fields
    if (!roleId || !name || !email || !phone || !resume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(resume.type)) {
      return NextResponse.json(
        { error: 'Resume must be a PDF or Word document' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (resume.size > maxSize) {
      return NextResponse.json(
        { error: 'Resume must be less than 5MB' },
        { status: 400 }
      )
    }

    // First check if role exists
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, title')
      .eq('id', roleId)
      .single()

    if (roleError || !roleData) {
      console.error('Role verification error:', roleError)
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    try {
      // Generate a unique filename with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `${timestamp}-${resume.name.replace(/\s+/g, '_')}`
      const filePath = `${roleId}/${email}/${fileName}`

      // Upload resume to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, resume, {
          contentType: resume.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Resume upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload resume. Please try again.' },
          { status: 500 }
        )
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('applications')
        .getPublicUrl(filePath)

      // Save application to database
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          role_id: roleId,
          applicant_name: name,
          applicant_email: email,
          applicant_phone: phone,
          cover_letter: coverLetter,
          resume_url: urlData?.publicUrl || filePath,
          status: 'pending',
          applied_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Application submission error:', insertError)
        return NextResponse.json(
          { error: 'Failed to submit application. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Application submitted successfully!'
      })
    } catch (error) {
      console.error('File processing error:', error)
      return NextResponse.json(
        { error: 'Error processing your application. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Application API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process application. Please try again later.' },
      { status: 500 }
    )
  }
} 