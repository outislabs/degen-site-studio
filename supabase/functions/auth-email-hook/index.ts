import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = "Degen Tools"
const SITE_URL = "https://degentools.co"
const FROM_EMAIL = "noreply@degentools.co"

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your DegenTools email',
  invite: "You've been invited to DegenTools",
  magiclink: 'Your DegenTools login link',
  recovery: 'Reset your DegenTools password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

// --- Simple HTML email templates (no React Email dependency needed) ---
function getEmailHTML(type: string, props: Record<string, any>): string {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0a;
    color: #ffffff;
    padding: 40px 20px;
    max-width: 600px;
    margin: 0 auto;
  `
  const buttonStyle = `
    display: inline-block;
    background: #00ff85;
    color: #000000;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    margin: 24px 0;
  `
  const cardStyle = `
    background: #111111;
    border: 1px solid #1e1e1e;
    border-radius: 12px;
    padding: 32px;
    margin: 20px 0;
  `

  const header = `
    <div style="margin-bottom: 24px;">
      <h1 style="color: #00ff85; font-size: 24px; margin: 0;">⚡ ${SITE_NAME}</h1>
    </div>
  `

  const footer = `
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e1e1e; color: #888888; font-size: 12px;">
      <p>You're receiving this email because you signed up at <a href="${SITE_URL}" style="color: #00ff85;">${SITE_URL}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `

  let body = ''

  switch (type) {
    case 'signup':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">Confirm your email address</h2>
        <p style="color: #888888; line-height: 1.6;">Welcome to ${SITE_NAME}! Click the button below to confirm your email and start building your meme coin empire.</p>
        <a href="${props.confirmationUrl}" style="${buttonStyle}">Confirm Email →</a>
        <p style="color: #555555; font-size: 12px;">Or copy this link: <br/><a href="${props.confirmationUrl}" style="color: #00ff85; word-break: break-all;">${props.confirmationUrl}</a></p>
      `
      break
    case 'recovery':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">Reset your password</h2>
        <p style="color: #888888; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new one.</p>
        <a href="${props.confirmationUrl}" style="${buttonStyle}">Reset Password →</a>
        <p style="color: #555555; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `
      break
    case 'magiclink':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">Your login link</h2>
        <p style="color: #888888; line-height: 1.6;">Click the button below to sign in to ${SITE_NAME}. This link expires in 1 hour.</p>
        <a href="${props.confirmationUrl}" style="${buttonStyle}">Sign In →</a>
        <p style="color: #555555; font-size: 12px;">If you didn't request this, ignore this email.</p>
      `
      break
    case 'invite':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">You've been invited!</h2>
        <p style="color: #888888; line-height: 1.6;">You've been invited to join ${SITE_NAME}. Click below to accept your invitation.</p>
        <a href="${props.confirmationUrl}" style="${buttonStyle}">Accept Invitation →</a>
      `
      break
    case 'email_change':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">Confirm your new email</h2>
        <p style="color: #888888; line-height: 1.6;">Click the button below to confirm your new email address.</p>
        <a href="${props.confirmationUrl}" style="${buttonStyle}">Confirm New Email →</a>
      `
      break
    case 'reauthentication':
      body = `
        <h2 style="color: #ffffff; font-size: 20px;">Your verification code</h2>
        <p style="color: #888888; line-height: 1.6;">Use this code to verify your identity:</p>
        <div style="background: #1e1e1e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="color: #00ff85; font-size: 32px; font-weight: 700; letter-spacing: 8px;">${props.token}</span>
        </div>
        <p style="color: #555555; font-size: 12px;">This code expires in 10 minutes.</p>
      `
      break
    default:
      body = `<p style="color: #888888;">You have a new notification from ${SITE_NAME}.</p>`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${EMAIL_SUBJECTS[type] || 'Notification'}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #0a0a0a;">
      <div style="${baseStyle}">
        <div style="${cardStyle}">
          ${header}
          ${body}
          ${footer}
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Resend error:', data)
    return false
  }

  console.log('Email sent via Resend:', data.id)
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Auth hook payload:', JSON.stringify(payload))

    // Supabase auth hook format
    const emailType = payload.email_data?.email_action_type || payload.type
    const email = payload.user?.email || payload.email_data?.email
    const confirmationUrl = payload.email_data?.redirect_to 
      || (payload.email_data?.token_hash 
        ? `${SITE_URL}/reset-password?token_hash=${payload.email_data.token_hash}&type=${emailType}`
        : SITE_URL)
    const token = payload.email_data?.token || ''

    console.log('Processing email:', { emailType, email })

    if (!email) {
      console.error('No email address in payload')
      return new Response(JSON.stringify({ error: 'No email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subject = EMAIL_SUBJECTS[emailType] || 'Notification from DegenTools'
    const html = getEmailHTML(emailType, { confirmationUrl, token, email })

    const sent = await sendEmailViaResend(email, subject, html)

    if (!sent) {
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log to Supabase
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      await supabase.from('email_send_log').insert({
        message_id: crypto.randomUUID(),
        template_name: emailType,
        recipient_email: email,
        status: 'sent',
      })
    } catch (logError) {
      console.error('Failed to log email:', logError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auth email hook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
