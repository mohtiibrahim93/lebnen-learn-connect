import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotification {
  to: string;
  studentName: string;
  tutorName: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, studentName, tutorName, scheduledAt, duration, meetingLink, status }: BookingNotification = await req.json();

    console.log("Sending booking notification:", { to, status });

    const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let subject = "";
    let html = "";

    if (status === "confirmed") {
      subject = "Your Lesson is Confirmed!";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e07856;">Lesson Confirmed!</h1>
          <p>Hi ${studentName},</p>
          <p>Great news! Your lesson with ${tutorName} has been confirmed.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #e07856;">${meetingLink}</a></p>` : ''}
          </div>
          <p>We're excited for your learning journey!</p>
          <p>Best regards,<br>Lebanese Arabic Team</p>
        </div>
      `;
    } else if (status === "cancelled") {
      subject = "Lesson Cancelled";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e07856;">Lesson Cancelled</h1>
          <p>Hi ${studentName},</p>
          <p>Unfortunately, your lesson with ${tutorName} scheduled for ${formattedDate} has been cancelled.</p>
          <p>You can book another lesson by visiting our tutor search page.</p>
          <p>Best regards,<br>Lebanese Arabic Team</p>
        </div>
      `;
    } else {
      subject = "New Lesson Request";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e07856;">New Lesson Request</h1>
          <p>Hi ${tutorName},</p>
          <p>You have a new lesson request from ${studentName}.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
          </div>
          <p>Please log in to your tutor dashboard to accept or decline this request.</p>
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
    console.error("Error sending booking notification:", error);
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
