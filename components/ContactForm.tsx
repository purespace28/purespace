"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";

interface Service {
  key: string;
  title: string;
}

interface ContactFormProps {
  variant?: "default" | "compact";
  services?: Service[];
}

export default function ContactForm({
  variant = "default",
  services,
}: ContactFormProps) {
  const { t, locale } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name =
        locale === "bg" ? "Името е задължително" : "Name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email =
        locale === "bg" ? "Имейлът е задължителен" : "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email =
          locale === "bg" ? "Невалиден имейл адрес" : "Invalid email address";
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone =
        locale === "bg" ? "Телефонът е задължителен" : "Phone is required";
    } else {
      const phoneLength = formData.phone.replace(/\s/g, "").length;
      if (phoneLength < 8 || phoneLength > 14) {
        newErrors.phone =
          locale === "bg"
            ? "Телефонът трябва да е между 8 и 14 символа"
            : "Phone must be between 8 and 14 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      setErrors({});
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = locale === "bg" 
        ? "Имейлът не успя да се изпрати. Моля, свържете се с нас директно по имейл (purespace28@gmail.com) или телефон (0897294189). 🙏"
        : "Email failed to send. Please contact us directly by email (purespace28@gmail.com) or phone (0897294189). 🙏";
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Determine which form texts to use
  let formTexts:
    | typeof t.contact.contactForm
    | typeof t.cleaning.contactForm
    | typeof t.landscaping.contactForm = t.contact.contactForm;
  if (variant === "compact") {
    if (services && services.length > 0) {
      // If services are provided, try to determine if it's cleaning or landscaping
      const firstServiceKey = services[0]?.key;
      if (
        firstServiceKey &&
        [
          "basic",
          "postRenovation",
          "furniture",
          "carpet",
          "windows",
          "car",
          "subscription",
        ].includes(firstServiceKey)
      ) {
        formTexts = t.cleaning.contactForm;
      } else if (
        firstServiceKey &&
        ["design", "maintenance", "creation", "pruning", "turf"].includes(
          firstServiceKey
        )
      ) {
        formTexts = t.landscaping.contactForm;
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="flex items-center text-sm font-semibold text-[#5682B1] mb-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {formTexts.name} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={
              locale === "bg" ? "Въведете вашето име" : "Enter your name"
            }
            className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
              errors.name
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#5682B1] focus:ring-[#5682B1] focus:border-[#739EC9] hover:border-[#739EC9] hover:shadow-md"
            }`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5682B1]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.name}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="flex items-center text-sm font-semibold text-[#5682B1] mb-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {formTexts.email} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={
              locale === "bg" ? "example@email.com" : "example@email.com"
            }
            className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
              errors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#5682B1] focus:ring-[#5682B1] focus:border-[#739EC9] hover:border-[#739EC9] hover:shadow-md"
            }`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5682B1]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="flex items-center text-sm font-semibold text-[#5682B1] mb-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {formTexts.phone} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder={locale === "bg" ? "089 123 4567" : "089 123 4567"}
            className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
              errors.phone
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#5682B1] focus:ring-[#5682B1] focus:border-[#739EC9] hover:border-[#739EC9] hover:shadow-md"
            }`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5682B1]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.phone}
          </p>
        )}
      </div>
      {services && services.length > 0 && (
        <div className="space-y-2">
          <label
            htmlFor="service"
            className="flex items-center text-sm font-semibold text-[#5682B1] mb-2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {"service" in formTexts
              ? formTexts.service
              : locale === "bg"
              ? "Избери услуга"
              : "Select service"}{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 pl-12 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white font-medium appearance-none cursor-pointer ${
                formData.service === "" ? "text-[#5682B1]" : "text-[#000000]"
              } ${
                errors.service
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-[#5682B1] focus:ring-[#5682B1] focus:border-[#739EC9] hover:border-[#739EC9] hover:shadow-md"
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235682B1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
              }}
            >
              <option value="" disabled className="bg-white text-[#5682B1]">
                {locale === "bg" ? "Избери услуга" : "Select service"}
              </option>
              {services.map((service) => (
                <option
                  key={service.key}
                  value={service.key}
                  className="bg-white text-[#000000] py-2"
                >
                  {service.title}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5682B1]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <label
          htmlFor="message"
          className="flex items-center text-sm font-semibold text-[#5682B1] mb-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {formTexts.message} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            required
            rows={variant === "compact" ? 4 : 6}
            value={formData.message}
            onChange={handleChange}
            placeholder={
              locale === "bg"
                ? "Напишете вашето съобщение тук..."
                : "Write your message here..."
            }
            className="w-full px-4 py-3 pl-12 border-2 border-[#5682B1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5682B1] focus:border-[#739EC9] transition-all hover:border-[#739EC9] hover:shadow-md resize-none bg-white"
          />
          <div className="absolute left-3 top-3 text-[#5682B1]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        </div>
      </div>
      {submitted && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-700 flex items-center font-semibold">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {locale === "bg" 
              ? "Имейлът е изпратен успешно! Ще се свържем с вас скоро." 
              : "Email sent successfully! We will contact you soon."}
          </p>
        </div>
      )}
      {errors.submit && !submitted && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.submit}</span>
          </p>
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting || submitted}
        className="w-full bg-gradient-to-r from-[#5682B1] to-[#739EC9] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-[#739EC9] hover:to-[#5682B1] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {submitted ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{locale === "bg" ? "Изпратено" : "Sent"}</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>{formTexts.send}</span>
          </>
        )}
      </button>
    </form>
  );
}
