import { useForm, FormProvider } from "react-hook-form";
import { FormTextField } from "../../components/ui/form-text-field";
import { Button } from "../../components/ui/button";

interface LoginForm {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SearchForm {
  query: string;
}

interface PrefillForm {
  name: string;
  org: string;
}

export function FormTextFieldPage() {
  const loginForm = useForm<LoginForm>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const searchForm = useForm<SearchForm>({ defaultValues: { query: "" } });

  const prefillForm = useForm<PrefillForm>({
    defaultValues: { name: "ResNet-50 Fine-Tune", org: "Matrice AI" },
  });

  const onSubmit = (data: LoginForm) => alert(JSON.stringify(data, null, 2));

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Form Text Field</h1>
        <p className="text-sm text-(--text-secondary)">
          react-hook-form wrapper around Input — handles value, onChange, onBlur, and error states automatically.
        </p>
      </div>

      {/* Login form */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Login Form Example</h2>
        <FormProvider {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onSubmit)} className="max-w-sm space-y-4">
            <FormTextField<LoginForm>
              name="email"
              label="Email"
              type="email"
              placeholder="you@matrice.ai"
              {...loginForm.register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" },
              })}
            />
            <FormTextField<LoginForm>
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              {...loginForm.register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
            <FormTextField<LoginForm>
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...loginForm.register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) =>
                  v === loginForm.getValues("password") || "Passwords do not match",
              })}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit">Sign In</Button>
              <Button type="button" variant="outline" onClick={() => loginForm.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </FormProvider>
        <p className="text-xs text-(--text-muted)">
          Submit with invalid data to see validation errors. All error messages come from react-hook-form.
        </p>
      </section>

      {/* With explicit control (no FormProvider) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Explicit Control (no FormProvider)</h2>
        <form
          onSubmit={searchForm.handleSubmit((d) => alert(d.query))}
          className="flex gap-2 max-w-sm"
        >
          <FormTextField<SearchForm>
            name="query"
            control={searchForm.control}
            placeholder="Search models…"
            className="flex-1"
            {...searchForm.register("query", { required: "Enter a search term" })}
          />
          <Button type="submit">Search</Button>
        </form>
      </section>

      {/* Pre-filled / disabled */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Pre-filled & Disabled</h2>
        <FormProvider {...prefillForm}>
          <div className="max-w-sm space-y-4">
            <FormTextField name="name" label="Run Name" />
            <FormTextField name="org" label="Organisation" disabled />
          </div>
        </FormProvider>
      </section>
    </div>
  );
}
