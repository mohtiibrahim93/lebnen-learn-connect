import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("Creating payment for booking:", bookingId);

    // Get booking details including tutor's hourly rate
    const { data: bookingData, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        tutor:tutor_id (
          id,
          user_id,
          hourly_rate,
          profiles:user_id (full_name)
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError) throw bookingError;
    if (!bookingData) throw new Error("Booking not found");

    // Calculate amount based on duration and hourly rate
    const hours = bookingData.duration_minutes / 60;
    const amount = Math.round(bookingData.tutor.hourly_rate * hours * 100); // Amount in cents

    console.log("Payment amount:", { hours, rate: bookingData.tutor.hourly_rate, amount });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lebanese Arabic Lesson with ${bookingData.tutor.profiles.full_name}`,
              description: `${bookingData.duration_minutes} minute lesson`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/student-dashboard?payment=success&booking=${bookingId}`,
      cancel_url: `${req.headers.get("origin")}/student-dashboard?payment=cancelled`,
      metadata: {
        booking_id: bookingId,
        student_id: user.id,
      },
    });

    // Update booking with payment intent
    await supabaseClient
      .from("bookings")
      .update({
        payment_intent_id: session.id,
        payment_status: "pending",
        amount_paid: bookingData.tutor.hourly_rate * hours,
      })
      .eq("id", bookingId);

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
