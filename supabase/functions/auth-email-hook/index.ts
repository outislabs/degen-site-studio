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
    const confirmationUrl = payload.email_data?.token_hash
      ? `${SITE_URL}/auth/confirm?token_hash=${payload.email_data.token_hash}&type=${emailType}`
      : payload.email_data?.redirect_to || SITE_URL
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
// Configuration
const SITE_NAME = "Degen Tools"
const SENDER_DOMAIN = "notify.degentools.co"
const ROOT_DOMAIN = "degentools.co"
const FROM_DOMAIN = "degentools.co" // Domain shown in From address (may be root or sender subdomain)

// Sample data for preview mode ONLY (not used in actual email sending).
// URLs are baked in at scaffold time from the project's real data.
// The sample email uses a fixed placeholder (RFC 6761 .test TLD) so the Go backend
// can always find-and-replace it with the actual recipient when sending test emails,
// even if the project's domain has changed since the template was scaffolded.
const SAMPLE_PROJECT_URL = "https://degen-site-studio.lovable.app"
const SAMPLE_EMAIL = "user@example.test"
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

// Preview endpoint handler - returns rendered HTML without sending email
async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// Webhook handler - verifies signature and sends email
async function handleWebhook(req: Request): Promise<Response> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')

  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify signature + timestamp, then parse payload.
  let payload: any
  let run_id = ''
  try {
    const verified = await verifyWebhookRequest({
      req,
      secret: apiKey,
      parser: parseEmailWebhookPayload,
    })
    payload = verified.payload
    run_id = payload.run_id
  } catch (error) {
    if (error instanceof WebhookError) {
      switch (error.code) {
        case 'invalid_signature':
        case 'missing_timestamp':
        case 'invalid_timestamp':
        case 'stale_timestamp':
          console.error('Invalid webhook signature', { error: error.message })
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        case 'invalid_payload':
        case 'invalid_json':
          console.error('Invalid webhook payload', { error: error.message })
          return new Response(
            JSON.stringify({ error: 'Invalid webhook payload' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    }

    console.error('Webhook verification failed', { error })
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!run_id) {
    console.error('Webhook payload missing run_id')
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (payload.version !== '1') {
    console.error('Unsupported payload version', { version: payload.version, run_id })
    return new Response(
      JSON.stringify({ error: `Unsupported payload version: ${payload.version}` }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // The email action type is in payload.data.action_type (e.g., "signup", "recovery")
  // payload.type is the hook event type ("auth")
  const emailType = payload.data.action_type
  console.log('Received auth event', { emailType, email: payload.data.email, run_id })

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType, run_id })
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Build template props from payload.data (HookData structure)
  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: payload.data.email,
    confirmationUrl: payload.data.url,
    token: payload.data.token,
    email: payload.data.email,
    newEmail: payload.data.new_email,
  }

  // Render React Email to HTML and plain text
  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  // Enqueue email for async processing by the dispatcher (process-email-queue).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const messageId = crypto.randomUUID()

  // Log pending BEFORE enqueue so we have a record even if enqueue crashes
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: payload.data.email,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      run_id,
      message_id: messageId,
      to: payload.data.email,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, run_id, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: payload.data.email,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Auth email enqueued', { emailType, email: payload.data.email, run_id })

  return new Response(
    JSON.stringify({ success: true, queued: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Handle CORS preflight for main endpoint
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route to preview handler for /preview path
  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  // Main webhook handler
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
