import React from "react";
import { Button } from "@heroui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { showSimpleSuccess } from "../../utils/sweetAlertHelper";

// Compact FormField component
const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  errors,
  touched,
  onChange,
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1 text-zinc-800">
      {label}
    </label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      className={`w-full px-3 py-2 text-sm rounded-md border ${
        touched[name] && errors[name]
          ? "border-red-500"
          : "border-gray-300 focus:border-cyan-500"
      } focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200`}
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-xs text-red-600 mt-0.5"
    />
  </div>
);

// Compact validation schema
const validationSchema = Yup.object({
  cardName: Yup.string()
    .required(t("required", "Required"))
    .min(3, t("minLength", { length: 3 })),
  cardNumber: Yup.string()
    .required(t("required", "Required"))
    .matches(/^[0-9\s]{13,19}$/, t("invalidCardNumber", "Invalid card number"))
    .test(
      "test-number",
      t("invalidCardNumber", "Invalid card number"),
      (value) => {
        const cardNumber = (value || "").replace(/\s/g, "");
        if (cardNumber.length < 13) return false;

        // Simplified Luhn check
        let sum = 0;
        let shouldDouble = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
          let digit = parseInt(cardNumber.charAt(i));
          if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
      },
    ),
  expiryDate: Yup.string()
    .required(t("required", "Required"))
    .matches(
      /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
      t("invalidExpiryFormat", "MM/YY format"),
    )
    .test("test-expiry", t("expiredCard", "Card expired"), (value) => {
      if (!value) return false;
      const [month, year] = value.split("/");
      const expiryDate = new Date(20 + year, month - 1, 1);
      return expiryDate > new Date();
    }),
  cvv: Yup.string()
    .required(t("required", "Required"))
    .matches(/^[0-9]{3,4}$/, t("invalidCVV", "Invalid CVV")),
});

// Formatters
const formatCardNumber = (value) => {
  if (!value) return value;
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  return parts.length ? parts.join(" ") : value;
};

const formatExpiryDate = (value) => {
  if (!value) return value;
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

  if (v.length >= 3) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  } else {
    return v;
  }
};

const CardDetailsForm = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-md mx-auto p-3 bg-white shadow-sm rounded-lg">
      <h2 className="text-lg font-bold mb-3 text-zinc-800">
        {t("payment", "Payment")}
      </h2>

      <Formik
        initialValues={{
          cardName: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(async () => {
            await showSimpleSuccess(t("paymentSuccess", "Payment Success"));
            setSubmitting(false);
          }, 500);
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FormField
                  label={t("cardName", "Name on card")}
                  name="cardName"
                  placeholder={t("enterCardName", "Enter name")}
                  errors={errors}
                  touched={touched}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  label={t("cardNumber", "Card Number")}
                  name="cardNumber"
                  placeholder={t("enterCardNumber", "XXXX XXXX XXXX XXXX")}
                  errors={errors}
                  touched={touched}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setFieldValue("cardNumber", formatted);
                  }}
                />
              </div>

              <div className="col-span-1">
                <FormField
                  label={t("expiryDate", "Expiry Date")}
                  name="expiryDate"
                  placeholder={t("enterExpiryDate", "MM/YY")}
                  errors={errors}
                  touched={touched}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setFieldValue("expiryDate", formatted);
                  }}
                />
              </div>

              <div className="col-span-1">
                <FormField
                  label={t("cvv", "CVV")}
                  name="cvv"
                  placeholder={t("enterCVV", "123")}
                  errors={errors}
                  touched={touched}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 text-sm rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("processing", "Processing...")}
                  </span>
                ) : (
                  t("completePayment", "Complete Payment")
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CardDetailsForm;
