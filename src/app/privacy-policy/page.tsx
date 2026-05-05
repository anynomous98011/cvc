export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        This policy explains how Rachna Rivo collects and uses your information to keep the platform safe and useful.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">What We Collect</h2>
        <p>We collect account details like name, email, and login activity to provide secure access.</p>
        <p>We may track page usage metrics such as time spent on pages to improve product quality.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Why We Collect Data</h2>
        <p>Data is used for authentication, account security, abuse prevention, analytics, and better recommendations.</p>
        <p>Admin-only analytics are restricted and not visible to regular users.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Security</h2>
        <p>We use secure session cookies and password hashing to protect account access.</p>
        <p>Access to sensitive user details is restricted to authorized admin users only.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Your Control</h2>
        <p>You can contact support to request account updates or deletion requests.</p>
      </section>
    </div>
  );
}
