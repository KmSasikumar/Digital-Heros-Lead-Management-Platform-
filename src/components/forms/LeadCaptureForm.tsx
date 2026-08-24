"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadCaptureSchema, LeadCaptureInput } from "@/lib/validations/lead";

export default function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadCaptureInput>({
    resolver: zodResolver(leadCaptureSchema),
  });

  const onSubmit = async (data: LeadCaptureInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/leads/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSuccess(true);
      reset();
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 max-w-md mx-auto text-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">Thank You!</h3>
        <p className="text-sm text-muted-foreground">
          We have received your details and will be in touch shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 w-full shadow-xl shadow-primary/5">
      <div className="flex flex-col space-y-2 mb-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight font-heading">Get in touch</h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and we'll contact you shortly.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center">
             An error occurred. Please try again.
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground/80">Name</label>
          <input
            {...register("name")}
            id="name"
            className="input-field"
            placeholder=""
          />
          {errors.name && <p className="text-xs font-medium text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="input-field"
            placeholder=""
          />
          {errors.email && <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-foreground/80">Company (Optional)</label>
          <input
            {...register("company")}
            id="company"
            className="input-field"
            placeholder=""
          />
          {errors.company && <p className="text-xs font-medium text-destructive mt-1">{errors.company.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone (Optional)</label>
          <input
            {...register("phone")}
            id="phone"
            className="input-field"
            placeholder=""
          />
          {errors.phone && <p className="text-xs font-medium text-destructive mt-1">{errors.phone.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full mt-4 h-11"
        >
          {isSubmitting ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
