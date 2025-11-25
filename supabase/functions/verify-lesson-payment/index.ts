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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("Verifying payment for booking:", bookingId);

    // Get booking with payment intent
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("payment_intent_id, payment_status")
      .eq("id", bookingId)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error("Booking not found");

    if (!booking.payment_intent_id) {
      return new Response(
        JSON.stringify({ status: "no_payment", message: "No payment initiated" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(booking.payment_intent_id);

    console.log("Payment session status:", session.payment_status);

    // Update booking based on payment status
    if (session.payment_status === "paid" && booking.payment_status !== "paid") {
      await supabaseClient
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", bookingId);

      console.log("Booking confirmed after payment");

      return new Response(
        JSON.stringify({ status: "paid", message: "Payment confirmed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ status: session.payment_status, message: "Payment status retrieved" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
