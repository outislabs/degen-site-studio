/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://yvjsruyebqyhgsmgfbtu.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="Degen Tools" width="120" height="auto" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>You've been invited 🎉</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.
          Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: 'hsl(220, 15%, 4%)', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', backgroundColor: 'hsl(220, 15%, 7%)', borderRadius: '12px', margin: '40px auto', maxWidth: '480px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 96%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(220, 10%, 50%)', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: 'hsl(142, 76%, 46%)', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(142, 76%, 46%)', color: 'hsl(240, 6%, 7%)', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: 'hsl(220, 10%, 35%)', margin: '30px 0 0' }
