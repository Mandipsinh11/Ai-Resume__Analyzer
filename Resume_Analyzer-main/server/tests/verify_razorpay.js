import "dotenv/config";
import Razorpay from "razorpay";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

console.log("Key ID:", RAZORPAY_KEY_ID);
console.log("Secret Length:", RAZORPAY_KEY_SECRET ? RAZORPAY_KEY_SECRET.length : 0);

try {
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  console.log("Attempting to fetch orders...");
  const orders = await razorpay.orders.all({ count: 1 });
  console.log("Success! Orders fetched:", orders);
} catch (error) {
  console.error("Razorpay verification failed:", error);
}
