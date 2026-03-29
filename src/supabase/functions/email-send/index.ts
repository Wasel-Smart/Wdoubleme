/**
 * Supabase Edge Function: Send Email
 * 
 * Handles email sending via SendGrid with templates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@wassel.com';
const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'Wassel';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, template, data } = await req.json();

    if (!to) {
      throw new Error('Recipient email is required');
    }

    let emailHtml = html;

    // Use template if provided
    if (template && data) {
      emailHtml = generateEmailFromTemplate(template, data);
    }

    if (!emailHtml && !subject) {
      throw new Error('Email content or template is required');
    }

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject || getTemplateSubject(template),
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        content: [{
          type: 'text/html',
          value: emailHtml,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Email sending failed');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Email sending failed:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Email sending failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateEmailFromTemplate(template: string, data: any): string {
  const templates: Record<string, (data: any) => string> = {
    'welcome': (d) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Wassel! 🚗</h1>
            </div>
            <div class="content">
              <h2>Hello ${d.name}!</h2>
              <p>Thank you for joining Wassel, your smart ride-sharing platform.</p>
              <p>We're excited to have you on board. Get started by booking your first ride!</p>
              <a href="${d.appUrl}" class="button">Book Your First Ride</a>
              <p>If you have any questions, our support team is here to help 24/7.</p>
            </div>
            <div class="footer">
              <p>© 2026 Wassel. All rights reserved.</p>
              <p>Dubai, United Arab Emirates</p>
            </div>
          </div>
        </body>
      </html>
    `,
    'trip_receipt': (d) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
            .receipt { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .total { font-size: 24px; font-weight: bold; color: #6366f1; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Trip Receipt</h1>
              <p>Trip ID: ${d.tripId}</p>
            </div>
            <div class="receipt">
              <h2>Trip Details</h2>
              <div class="row">
                <span>Date:</span>
                <span>${d.date}</span>
              </div>
              <div class="row">
                <span>From:</span>
                <span>${d.from}</span>
              </div>
              <div class="row">
                <span>To:</span>
                <span>${d.to}</span>
              </div>
              <div class="row">
                <span>Distance:</span>
                <span>${d.distance} km</span>
              </div>
              <div class="row">
                <span>Base Fare:</span>
                <span>AED ${d.baseFare}</span>
              </div>
              <div class="row">
                <span>Distance Fare:</span>
                <span>AED ${d.distanceFare}</span>
              </div>
              <div class="row">
                <span>Time Fare:</span>
                <span>AED ${d.timeFare}</span>
              </div>
              <div class="total">
                <div class="row">
                  <span>Total:</span>
                  <span>AED ${d.totalFare}</span>
                </div>
              </div>
              <p style="margin-top: 30px; text-align: center; color: #666;">
                Thank you for riding with Wassel!
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  return templates[template]?.(data) || '';
}

function getTemplateSubject(template: string): string {
  const subjects: Record<string, string> = {
    'welcome': 'Welcome to Wassel!',
    'trip_receipt': 'Your Trip Receipt',
    'password_reset': 'Reset Your Password',
    'verification': 'Verify Your Email',
  };

  return subjects[template] || 'Wassel Notification';
}