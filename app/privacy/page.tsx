import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Shield, Eye, Lock, Database, UserCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl mb-8">Your privacy is our priority. Learn how we protect and use your information.</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: January 15, 2024
              </div>
              <Badge variant="secondary">GDPR Compliant</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Quick Overview */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Quick Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span>We don't sell your data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>End-to-end encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-green-600" />
                      <span>Secure data storage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>You control your data</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <a href="#information" className="block text-sm text-blue-600 hover:underline">
                        Information We Collect
                      </a>
                      <a href="#usage" className="block text-sm text-blue-600 hover:underline">
                        How We Use Information
                      </a>
                      <a href="#sharing" className="block text-sm text-blue-600 hover:underline">
                        Information Sharing
                      </a>
                      <a href="#security" className="block text-sm text-blue-600 hover:underline">
                        Data Security
                      </a>
                      <a href="#rights" className="block text-sm text-blue-600 hover:underline">
                        Your Rights
                      </a>
                      <a href="#cookies" className="block text-sm text-blue-600 hover:underline">
                        Cookies
                      </a>
                      <a href="#contact" className="block text-sm text-blue-600 hover:underline">
                        Contact Us
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 leading-relaxed">
                      At Stars2Screen, we are committed to protecting your privacy and ensuring the security of your
                      personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
                      your information when you use our platform.
                    </p>
                  </CardContent>
                </Card>

                <Card id="information">
                  <CardHeader>
                    <CardTitle>Information We Collect</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <h4>Personal Information</h4>
                    <p>When you create an account, we collect:</p>
                    <ul>
                      <li>Name, email address, and phone number</li>
                      <li>Professional information (experience, skills, location)</li>
                      <li>Profile photos and portfolio materials</li>
                      <li>Payment information (processed securely by third-party providers)</li>
                    </ul>

                    <h4>Usage Information</h4>
                    <p>We automatically collect certain information about your use of our platform:</p>
                    <ul>
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage patterns and preferences</li>
                      <li>Log data (access times, pages viewed, actions taken)</li>
                      <li>Communication data (messages sent through our platform)</li>
                    </ul>

                    <h4>Third-Party Information</h4>
                    <p>We may receive information from third parties such as:</p>
                    <ul>
                      <li>Social media platforms (if you connect your accounts)</li>
                      <li>Professional references and recommendations</li>
                      <li>Public databases and industry directories</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card id="usage">
                  <CardHeader>
                    <CardTitle>How We Use Your Information</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>We use your information to:</p>
                    <ul>
                      <li>
                        <strong>Provide our services:</strong> Create and maintain your profile, facilitate connections,
                        process payments
                      </li>
                      <li>
                        <strong>Improve our platform:</strong> Analyze usage patterns, develop new features, enhance
                        user experience
                      </li>
                      <li>
                        <strong>Communicate with you:</strong> Send notifications, updates, marketing communications
                        (with your consent)
                      </li>
                      <li>
                        <strong>Ensure security:</strong> Detect fraud, prevent abuse, maintain platform integrity
                      </li>
                      <li>
                        <strong>Legal compliance:</strong> Meet legal obligations, respond to legal requests
                      </li>
                    </ul>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="text-blue-800 font-semibold mb-2">Legal Basis for Processing (GDPR)</h4>
                      <p className="text-blue-700 text-sm">
                        We process your personal data based on: contract performance, legitimate interests, legal
                        compliance, and your consent (which you can withdraw at any time).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card id="sharing">
                  <CardHeader>
                    <CardTitle>Information Sharing and Disclosure</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      We do not sell, trade, or rent your personal information to third parties. We may share your
                      information in the following circumstances:
                    </p>

                    <h4>With Other Users</h4>
                    <ul>
                      <li>Profile information you choose to make public</li>
                      <li>Messages and communications you send to other users</li>
                      <li>Professional recommendations and reviews (with your consent)</li>
                    </ul>

                    <h4>With Service Providers</h4>
                    <ul>
                      <li>Payment processors (Stripe, PayPal)</li>
                      <li>Cloud storage providers (AWS, Google Cloud)</li>
                      <li>Analytics services (Google Analytics)</li>
                      <li>Customer support tools</li>
                    </ul>

                    <h4>Legal Requirements</h4>
                    <p>We may disclose your information if required by law or to:</p>
                    <ul>
                      <li>Comply with legal processes or government requests</li>
                      <li>Protect our rights, property, or safety</li>
                      <li>Prevent fraud or illegal activities</li>
                      <li>Enforce our Terms of Service</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card id="security">
                  <CardHeader>
                    <CardTitle>Data Security</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>We implement comprehensive security measures to protect your information:</p>

                    <h4>Technical Safeguards</h4>
                    <ul>
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>AES-256 encryption for data storage</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Multi-factor authentication options</li>
                    </ul>

                    <h4>Organizational Safeguards</h4>
                    <ul>
                      <li>Limited access to personal data on a need-to-know basis</li>
                      <li>Regular employee training on data protection</li>
                      <li>Incident response procedures</li>
                      <li>Data retention and deletion policies</li>
                    </ul>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                      <h4 className="text-green-800 font-semibold mb-2">Security Certifications</h4>
                      <p className="text-green-700 text-sm">
                        Our platform is SOC 2 Type II certified and complies with industry-standard security frameworks
                        including ISO 27001.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card id="rights">
                  <CardHeader>
                    <CardTitle>Your Privacy Rights</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>You have the following rights regarding your personal information:</p>

                    <h4>Access and Portability</h4>
                    <ul>
                      <li>Request a copy of your personal data</li>
                      <li>Download your data in a portable format</li>
                      <li>View how your data is being used</li>
                    </ul>

                    <h4>Correction and Updates</h4>
                    <ul>
                      <li>Update your profile information at any time</li>
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Request verification of data accuracy</li>
                    </ul>

                    <h4>Deletion and Restriction</h4>
                    <ul>
                      <li>Delete your account and associated data</li>
                      <li>Request deletion of specific information</li>
                      <li>Restrict processing of your data</li>
                    </ul>

                    <h4>Consent Management</h4>
                    <ul>
                      <li>Withdraw consent for marketing communications</li>
                      <li>Opt-out of data processing for certain purposes</li>
                      <li>Manage cookie preferences</li>
                    </ul>

                    <p>
                      To exercise these rights, contact us at privacy@stars2screen.com or use the privacy controls in
                      your account settings.
                    </p>
                  </CardContent>
                </Card>

                <Card id="cookies">
                  <CardHeader>
                    <CardTitle>Cookies and Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>We use cookies and similar technologies to enhance your experience:</p>

                    <h4>Essential Cookies</h4>
                    <ul>
                      <li>Authentication and security</li>
                      <li>Session management</li>
                      <li>Load balancing and performance</li>
                    </ul>

                    <h4>Analytics Cookies</h4>
                    <ul>
                      <li>Usage statistics and performance metrics</li>
                      <li>Feature usage analysis</li>
                      <li>Error tracking and debugging</li>
                    </ul>

                    <h4>Marketing Cookies</h4>
                    <ul>
                      <li>Personalized content and recommendations</li>
                      <li>Advertising effectiveness measurement</li>
                      <li>Social media integration</li>
                    </ul>

                    <p>
                      You can manage your cookie preferences through your browser settings or our cookie consent
                      manager.
                    </p>
                  </CardContent>
                </Card>

                <Card id="contact">
                  <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">General Privacy Inquiries</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Email: privacy@stars2screen.com</p>
                          <p>Phone: +1 (555) 123-4567</p>
                          <p>Response time: Within 48 hours</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Email: dpo@stars2screen.com</p>
                          <p>Address: 123 Entertainment Blvd</p>
                          <p>Los Angeles, CA 90028</p>
                        </div>
                      </div>
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
