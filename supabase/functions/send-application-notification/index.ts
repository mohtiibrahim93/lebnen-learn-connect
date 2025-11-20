import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationNotification {
  to: string;
  applicantName: string;
  status: "approved" | "rejected";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, applicantName, status }: ApplicationNotification = await req.json();

    console.log("Sending application notification:", { to, status });

    let subject = "";
    let html = "";

    if (status === "approved") {
      subject = "Congratulations! Your Tutor Application is Approved";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e07856;">Welcome to Our Tutor Community!</h1>
          <p>Hi ${applicantName},</p>
          <p>Congratulations! Your application to become a tutor has been approved.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>You can now:</p>
            <ul>
              <li>Access your tutor dashboard</li>
              <li>Manage booking requests</li>
              <li>Create and upload courses</li>
              <li>Update your profile and rates</li>
            </ul>
          </div>
          <p>Log in to get started and help students learn Lebanese Arabic!</p>
          <p>Best regards,<br>Lebanese Arabic Team</p>
        </div>
      `;
    } else {
      subject = "Update on Your Tutor Application";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e07856;">Application Status Update</h1>
          <p>Hi ${applicantName},</p>
          <p>Thank you for your interest in becoming a tutor on our platform.</p>
          <p>After careful review, we are unable to approve your application at this time.</p>
          <p>We encourage you to continue developing your teaching skills and consider reapplying in the future.</p>
          <p>Best regards,<br>Lebanese Arabic Team</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Lebanese Arabic <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending application notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
