import {
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Text,
  Section,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&aspos;s your verification code:{otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering.Please use the following verification code
            to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text>
            <strong>{otp}</strong>
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
