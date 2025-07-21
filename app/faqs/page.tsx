import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, HelpCircle, Users, CreditCard, Shield, MessageCircle } from "lucide-react"

const faqCategories = [
  {
    id: "general",
    title: "General",
    icon: HelpCircle,
    color: "bg-blue-500",
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: Users,
    color: "bg-green-500",
  },
  {
    id: "billing",
    title: "Billing & Payments",
    icon: CreditCard,
    color: "bg-purple-500",
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: Shield,
    color: "bg-red-500",
  },
  {
    id: "messaging",
    title: "Messaging & Communication",
    icon: MessageCircle,
    color: "bg-orange-500",
  },
]

const faqs = [
  {
    category: "general",
    question: "What is Stars2Screen?",
    answer:
      "Stars2Screen is a professional networking platform designed specifically for the film and entertainment industry. We connect actors, directors, producers, technicians, and other industry professionals to help them find opportunities, collaborate on projects, and build their careers.",
  },
  {
    category: "general",
    question: "How do I get started on Stars2Screen?",
    answer:
      "Getting started is easy! Simply sign up for a free account, complete your profile with your professional information, upload your portfolio or demo reel, and start connecting with other industry professionals. You can browse profiles by category, location, or specific skills.",
  },
  {
    category: "general",
    question: "Is Stars2Screen free to use?",
    answer:
      "Stars2Screen offers both free and premium memberships. Free members can create profiles, browse other professionals, and send limited messages. Premium members get unlimited messaging, advanced search filters, priority profile placement, and access to exclusive job postings.",
  },
  {
    category: "account",
    question: "How do I create a compelling profile?",
    answer:
      "A great profile includes: a professional headshot, detailed work experience, skills and specializations, portfolio samples or demo reel, contact information, and testimonials from previous collaborators. Be specific about your experience and what type of projects you're looking for.",
  },
  {
    category: "account",
    question: "Can I have multiple profiles for different roles?",
    answer:
      "Currently, each user can have one primary profile, but you can list multiple skills and roles within that profile. For example, if you're both an actor and a director, you can showcase both skill sets in your single profile.",
  },
  {
    category: "account",
    question: "How do I verify my profile?",
    answer:
      "Profile verification helps build trust in our community. You can verify your profile by providing professional references, linking to your IMDb page, or uploading certificates from film schools or industry organizations. Verified profiles get a special badge and higher visibility.",
  },
  {
    category: "billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.",
  },
  {
    category: "billing",
    question: "Can I cancel my premium subscription anytime?",
    answer:
      "Yes, you can cancel your premium subscription at any time from your account settings. Your premium features will remain active until the end of your current billing period, after which your account will revert to the free tier.",
  },
  {
    category: "billing",
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for premium subscriptions. If you're not satisfied with your premium membership within the first 30 days, contact our support team for a full refund.",
  },
  {
    category: "privacy",
    question: "How do you protect my personal information?",
    answer:
      "We take privacy seriously. Your personal information is encrypted and stored securely. We never sell your data to third parties. You have full control over what information is visible on your profile and who can contact you.",
  },
  {
    category: "privacy",
    question: "Can I control who sees my profile?",
    answer:
      "Yes, you have several privacy options: make your profile public to all users, visible only to verified professionals, or private (searchable but with limited information). You can also block specific users if needed.",
  },
  {
    category: "privacy",
    question: "How do I report inappropriate behavior?",
    answer:
      "If you encounter inappropriate behavior, harassment, or spam, please report it immediately using the report button on profiles or messages. Our moderation team reviews all reports within 24 hours and takes appropriate action.",
  },
  {
    category: "messaging",
    question: "How does the messaging system work?",
    answer:
      "Our messaging system allows you to communicate directly with other professionals. Free members can send 5 messages per month, while premium members have unlimited messaging. All conversations are private and secure.",
  },
  {
    category: "messaging",
    question: "Can I share files through messages?",
    answer:
      "Yes, you can share images, documents, and video files up to 50MB per file. This is perfect for sharing scripts, portfolios, or project details. Premium members can share larger files up to 200MB.",
  },
  {
    category: "messaging",
    question: "How do I know if someone has read my message?",
    answer:
      "Messages show delivery and read receipts. You'll see a single checkmark when the message is delivered and a double checkmark when it's been read. Users can disable read receipts in their privacy settings.",
  },
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl mb-8">Find answers to common questions about Stars2Screen</p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search FAQs..." className="pl-10 bg-white text-gray-900" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{category.title}</h3>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqCategories.map((category) => {
              const categoryFaqs = faqs.filter((faq) => faq.category === category.id)
              const Icon = category.icon

              return (
                <div key={category.id} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {categoryFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-4">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Contact Support</Button>
              <Button variant="outline" size="lg">
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
