import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import * as crypto from "crypto";

admin.initializeApp();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Helper to initialize Razorpay
 */
const getRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Razorpay credentials are not configured in environment variables."
    );
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

/**
 * Endpoint to create a Razorpay Order
 */
export const createOrder = functions.region("asia-south1").https.onCall(async (data, context) => {
  const { amount, currency = "INR" } = data;

  if (!amount || amount < 100) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount must be at least 100 paise (1 INR)."
    );
  }

  try {
    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to create Razorpay order."
    );
  }
});

/**
 * Endpoint to verify Razorpay Payment Signature
 */
export const verifyPayment = functions.region("asia-south1").https.onCall(async (data, context) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required payment verification fields."
    );
  }

  const secret = RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Razorpay secret not configured."
    );
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return { success: true, message: "Payment verified successfully" };
  } else {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Invalid payment signature."
    );
  }
});
