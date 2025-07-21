import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms & Conditions</h1>
            <p className="text-xl mb-8">Please read these terms carefully before using Stars2Screen</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: January 15, 2024
              </div>
              <Badge variant="secondary">Version 2.1</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <a href="#acceptance" className="block text-sm text-blue-600 hover:underline">
                      1. Acceptance of Terms
                    </a>
                    <a href="#description" className="block text-sm text-blue-600 hover:underline">
                      2. Service Description
                    </a>
                    <a href="#accounts" className="block text-sm text-blue-600 hover:underline">
                      3. User Accounts
                    </a>
                    <a href="#conduct" className="block text-sm text-blue-600 hover:underline">
                      4. User Conduct
                    </a>
                    <a href="#content" className="block text-sm text-blue-600 hover:underline">
                      5. Content Policy
                    </a>
                    <a href="#privacy" className="block text-sm text-blue-600 hover:underline">
                      6. Privacy
                    </a>
                    <a href="#payments" className="block text-sm text-blue-600 hover:underline">
                      7. Payments
                    </a>
                    <a href="#termination" className="block text-sm text-blue-600 hover:underline">
                      8. Termination
                    </a>
                    <a href="#liability" className="block text-sm text-blue-600 hover:underline">
                      9. Liability
                    </a>
                    <a href="#changes" className="block text-sm text-blue-600 hover:underline">
                      10. Changes to Terms
                    </a>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                <Card id="acceptance">
                  <CardHeader>
                    <CardTitle>1. Acceptance of Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      By accessing and using Stars2Screen ("the Service"), you accept and agree to be bound by the terms
                      and provision of this agreement. If you do not agree to abide by the above, please do not use this
                      service.
                    </p>
                    <p>
                      These Terms of Service ("Terms") govern your use of our website located at stars2screen.com (the
                      "Service") operated by Stars2Screen ("us", "we", or "our").
                    </p>
                  </CardContent>
                </Card>

                <Card id="description">
                  <CardHeader>
                    <CardTitle>2. Service Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      Stars2Screen is a professional networking platform designed for the film and entertainment
                      industry. Our services include:
                    </p>
                    <ul>
                      <li>Professional profile creation and management</li>
                      <li>Networking and messaging capabilities</li>
                      <li>Job posting and application features</li>
                      <li>Portfolio and media sharing</li>
                      <li>Industry news and resources</li>
                    </ul>
                    <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
                  </CardContent>
                </Card>

                <Card id="accounts">
                  <CardHeader>
                    <CardTitle>3. User Accounts</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      To access certain features of the Service, you must register for an account. When you create an
                      account, you must provide information that is accurate, complete, and current at all times.
                    </p>
                    <p>
                      You are responsible for safeguarding the password and for maintaining the confidentiality of your
                      account. You agree not to disclose your password to any third party and to take sole
                      responsibility for any activities or actions under your account.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800">Important:</p>
                        <p className="text-yellow-700 text-sm">
                          You must be at least 18 years old to create an account and use our services.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="conduct">
                  <CardHeader>
                    <CardTitle>4. User Conduct</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      You agree to use the Service only for lawful purposes and in accordance with these Terms. You
                      agree not to use the Service:
                    </p>
                    <ul>
                      <li>
                        To transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory,
                        vulgar, obscene, or otherwise objectionable
                      </li>
                      <li>
                        To impersonate any person or entity or falsely state or misrepresent your affiliation with a
                        person or entity
                      </li>
                      <li>
                        To transmit any unsolicited or unauthorized advertising, promotional materials, spam, or any
                        other form of solicitation
                      </li>
                      <li>To interfere with or disrupt the Service or servers or networks connected to the Service</li>
                      <li>To attempt to gain unauthorized access to any portion of the Service</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card id="content">
                  <CardHeader>
                    <CardTitle>5. Content Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      You retain ownership of any intellectual property rights that you hold in content that you submit
                      to the Service. However, by submitting content, you grant us a worldwide, non-exclusive,
                      royalty-free license to use, reproduce, modify, and distribute your content in connection with the
                      Service.
                    </p>
                    <p>
                      You represent and warrant that you own or have the necessary rights to all content you submit and
                      that such content does not infringe any third-party rights.
                    </p>
                    <p>
                      We reserve the right to remove any content that violates these Terms or that we deem inappropriate
                      for any reason.
                    </p>
                  </CardContent>
                </Card>

                <Card id="privacy">
                  <CardHeader>
                    <CardTitle>6. Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                      information when you use our Service. By using our Service, you agree to the collection and use of
                      information in accordance with our Privacy Policy.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">Data Protection:</p>
                        <p className="text-blue-700 text-sm">
                          We comply with GDPR and other applicable data protection laws. You have the right to access,
                          update, or delete your personal information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="payments">
                  <CardHeader>
                    <CardTitle>7. Payments and Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      Some features of the Service require payment. By purchasing a subscription, you agree to pay all
                      fees associated with your chosen plan. All fees are non-refundable except as required by law or as
                      specifically stated in these Terms.
                    </p>
                    <p>
                      Subscriptions automatically renew unless cancelled before the renewal date. You can cancel your
                      subscription at any time from your account settings.
                    </p>
                    <p>
                      We offer a 30-day money-back guarantee for new premium subscriptions. Contact support within 30
                      days of your initial purchase for a full refund.
                    </p>
                  </CardContent>
                </Card>

                <Card id="termination">
                  <CardHeader>
                    <CardTitle>8. Termination</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      We may terminate or suspend your account and bar access to the Service immediately, without prior
                      notice or liability, under our sole discretion, for any reason whatsoever, including but not
                      limited to a breach of the Terms.
                    </p>
                    <p>
                      You may terminate your account at any time by contacting us or using the account deletion feature
                      in your settings.
                    </p>
                    <p>
                      Upon termination, your right to use the Service will cease immediately. All provisions of the
                      Terms which by their nature should survive termination shall survive termination.
                    </p>
                  </CardContent>
                </Card>

                <Card id="liability">
                  <CardHeader>
                    <CardTitle>9. Limitation of Liability</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      In no event shall Stars2Screen, nor its directors, employees, partners, agents, suppliers, or
                      affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                      including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                      resulting from your use of the Service.
                    </p>
                    <p>
                      The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed
                      or implied, and hereby disclaim all other warranties including implied warranties of
                      merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                  </CardContent>
                </Card>

                <Card id="changes">
                  <CardHeader>
                    <CardTitle>10. Changes to Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                      revision is material, we will provide at least 30 days notice prior to any new terms taking
                      effect.
                    </p>
                    <p>
                      By continuing to access or use our Service after any revisions become effective, you agree to be
                      bound by the revised terms.
                    </p>
                  </CardContent>
                </Card>

                <Separator className="my-8" />

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Contact Information</h3>
                    <p className="text-gray-600">
                      If you have any questions about these Terms & Conditions, please contact us at:
                    </p>
                    <div className="mt-4 space-y-1 text-sm">
                      <p>Email: legal@stars2screen.com</p>
                      <p>Address: 123 Entertainment Blvd, Los Angeles, CA 90028</p>
                      <p>Phone: +1 (555) 123-4567</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
