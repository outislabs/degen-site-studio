/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://yvjsruyebqyhgsmgfbtu.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="Degen Tools" width="120" height="auto" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>Verify your identity</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: 'hsl(220, 15%, 4%)', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', backgroundColor: 'hsl(220, 15%, 7%)', borderRadius: '12px', margin: '40px auto', maxWidth: '480px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 96%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(220, 10%, 50%)', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = { fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: 'hsl(142, 76%, 46%)', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: 'hsl(220, 10%, 35%)', margin: '30px 0 0' }
