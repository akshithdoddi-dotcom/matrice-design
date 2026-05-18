import { Link } from "../../components/ui/link";

export function LinkPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Link</h1>
        <p className="text-sm text-(--text-secondary)">
          Anchor component with default, muted, and unstyled variants. Supports external links.
        </p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Variants</h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-(--text-primary)">
            See the full{" "}
            <Link href="#">documentation</Link>
            {" "}for examples and usage.
          </p>
          <p className="text-sm text-(--text-primary)">
            Learn more about{" "}
            <Link href="#" variant="muted">model training best practices</Link>
            {" "}in our knowledge base.
          </p>
          <p className="text-sm text-(--text-primary)">
            Powered by{" "}
            <Link href="#" variant="unstyled">Matrice AI Platform</Link>
          </p>
        </div>
      </section>

      {/* External links */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">External</h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-(--text-primary)">
            Read the{" "}
            <Link href="https://docs.matrice.ai" external>API reference</Link>
            {" "}on our developer portal.
          </p>
          <p className="text-sm text-(--text-primary)">
            View the{" "}
            <Link href="https://github.com" external variant="muted">source on GitHub</Link>
          </p>
        </div>
      </section>

      {/* Inline in a paragraph */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Inline Usage</h2>
        <p className="text-sm text-(--text-secondary) leading-relaxed max-w-prose">
          The Matrice AI Platform supports{" "}
          <Link href="#">computer vision</Link>,{" "}
          <Link href="#">natural language processing</Link>, and{" "}
          <Link href="#">multimodal models</Link>. Explore our{" "}
          <Link href="#" variant="muted">model zoo</Link>{" "}
          or{" "}
          <Link href="https://matrice.ai" external>visit our website</Link>{" "}
          to learn more.
        </p>
      </section>

      {/* As button */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">As Span (asChild)</h2>
        <p className="text-sm text-(--text-secondary)">
          Use <code className="text-xs bg-(--surface) px-1 py-0.5 rounded">asChild</code> to compose with a router link:
        </p>
        <pre className="text-xs bg-(--surface) border border-(--border-color) rounded-lg p-4 overflow-x-auto">{`<Link asChild>
  <RouterLink to="/settings">Settings</RouterLink>
</Link>`}</pre>
      </section>
    </div>
  );
}
