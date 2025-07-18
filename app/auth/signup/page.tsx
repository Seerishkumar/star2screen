import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="container flex flex-col items-center justify-center px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join our platform to start writing articles</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
