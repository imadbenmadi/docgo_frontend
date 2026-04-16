// import React, { useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//     Elements,
//     CardElement,
//     useStripe,
//     useElements,
// } from "@stripe/react-stripe-js";
// import CardDetailsForm from "./CardDetailsForm";
// import BaridiMobForm from "./BaridiMobForm";

// // Load your Stripe publishable key
// const stripePromise = loadStripe(
//     "pk_test_51QwSSUQNMb3CvX3QKafwWLzlvPaG8rBcAxWZ7Kpzhfs9g3DIW7tspZMrCrZzaIqAV77HdKH3AeXUvjfGXC0C9R0w00kt21CaQe"
// ); // Replace with your Stripe publishable key

// const StripePaymentForm = () => {
//     const stripe = useStripe();
//     const elements = useElements();
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!stripe || !elements) {
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         try {
//             // Hardcoded clientSecret for testing (replace with a real one from Stripe Dashboard)
//             const clientSecret =
//                 "pi_3QwSpdQNMb3CvX3Q0Wd0pJk8_secret_11Zv7fH62O5vXo8pM80hHOmqi";

//             // Confirm the payment on the client side
//             const { error: stripeError, paymentIntent } =
//                 await stripe.confirmCardPayment(clientSecret, {
//                     payment_method: {
//                         card: elements.getElement(CardElement),
//                     },
//                 });

//             if (stripeError) {
//                 setError(stripeError.message);
//             } else if (paymentIntent.status === "succeeded") {
//                 alert("Payment succeeded!");
//                 // Handle successful payment (e.g., redirect or show success message)
//             }
//         } catch (error) {
//             setError("An error occurred while processing your payment.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="w-full space-y-6">
//             {/* CardElement Container */}
//             <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
//                 <CardElement
//                     options={{
//                         style: {
//                             base: {
//                                 fontSize: "16px",
//                                 color: "#424770",
//                                 "::placeholder": {
//                                     color: "#aab7c4",
//                                 },
//                             },
//                             invalid: {
//                                 color: "#9e2146",
//                             },
//                         },
//                     }}
//                 />
//             </div>

//             {/* Error Message */}
//             {error && (
//                 <div className="text-red-500 text-sm text-center mt-2">
//                     {error}
//                 </div>
//             )}

//             {/* Submit Button */}
//             <button
//                 type="submit"
//                 disabled={!stripe || loading}
//                 className="w-full px-6 py-3 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//                 {loading ? (
//                     <div className="flex items-center justify-center gap-2">
//                         <span>Processing...</span>
//                         <svg
//                             className="animate-spin h-5 w-5 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                         >
//                             <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                             ></circle>
//                             <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                             ></path>
//                         </svg>
//                     </div>
//                 ) : (
//                     "Pay with Stripe"
//                 )}
//             </button>
//         </form>
//     );
// };
// const Payment = () => {
//     const [methodePaiement, setMethodePaiement] = useState("visa");

//     return (
//         <main className="flex flex-wrap gap-10 items-start px-20 justify-center w-full bg-white max-md:px-5">
//             <aside className="flex flex-col items-start max-w-full w-[416px]">
//                 <section className="max-w-full w-[311px]">
//                     <h2 className="text-base leading-relaxed text-zinc-800">
//                         Choisissez votre méthode de paiement
//                     </h2>
//                     <div className="flex gap-4 items-center mt-4 w-full">
//                         <button
//                             onClick={() => setMethodePaiement("visa")}
//                             className={`flex gap-2 items-center self-stretch my-auto w-[94px] ${
//                                 methodePaiement === "visa"
//                                     ? "border-2 border-blue-500 rounded-lg"
//                                     : ""
//                             }`}
//                         >
//                             <div className="flex flex-col justify-center self-stretch p-1.5 my-auto bg-sky-50 rounded-2xl border border-solid w-[94px]">
//                                 <img
//                                     src="https://cdn.builder.io/api/v1/image/assets/TEMP/ec4b9f8d9b703febf8b188631f45fd1e2677e01f746e06f68f6fea86a813530b?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
//                                     alt="Visa"
//                                     className="object-contain w-full aspect-[1.78]"
//                                 />
//                             </div>
//                         </button>
//                         <button
//                             onClick={() => setMethodePaiement("baridiMob")}
//                             className={`flex gap-2 items-center self-stretch my-auto w-[94px] ${
//                                 methodePaiement === "baridiMob"
//                                     ? "border-2 border-blue-500 rounded-lg"
//                                     : ""
//                             }`}
//                         >
//                             <div className="flex gap-1.5 justify-center items-center self-stretch p-1.5 my-auto rounded-2xl border border-solid w-[94px]">
//                                 <img
//                                     src="https://cdn.builder.io/api/v1/image/assets/TEMP/7376212805dc227f9035e4c3490af46054730168a65f266c143884a1ab8bfe77?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
//                                     alt="Baridi Mob"
//                                     className="object-contain self-stretch my-auto aspect-square w-[46px]"
//                                 />
//                             </div>
//                         </button>
//                     </div>
//                 </section>

//                 <section className="mt-8 max-w-full">
//                     <div className="max-w-full text-zinc-800 w-[262px]">
//                         <h2 className="text-2xl leading-10">
//                             Montant du paiement
//                         </h2>
//                         <p className="mt-1.5 text-4xl font-semibold">7652$</p>
//                     </div>
//                 </section>
//             </aside>
//             <section className="flex flex-col self-start max-md:max-w-full">
//                 {methodePaiement === "visa" ? (
//                     // <Elements stripe={stripePromise}>
//                     //   <StripePaymentForm />
//                     // </Elements>
//                     <CardDetailsForm />
//                 ) : (
//                     <BaridiMobForm />
//                 )}
//             </section>
//         </main>
//     );
// };

// export default Payment;

const Payment = () => {
    return <div>test</div>;
};
export default Payment;
