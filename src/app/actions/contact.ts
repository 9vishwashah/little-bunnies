"use server";

export async function submitContactMessage(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!name || !email || !message) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      console.error("WEB3FORMS_ACCESS_KEY is not set.");
      return { success: false, error: "Server configuration error. Please contact us via WhatsApp." };
    }

    const payload = {
      access_key: accessKey,
      subject: "New Contact Form Submission — Little Bunnies",
      from_name: name,
      name,
      email,
      phone: phone || "Not provided",
      message,
    };

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Always read as text first — Web3Forms can return HTML on errors
    const rawText = await response.text();

    let data: { success?: boolean; message?: string } = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      // Web3Forms returned HTML (bad key, network issue, etc.)
      console.error(
        "Web3Forms returned non-JSON response. Status:",
        response.status,
        "Body (first 300 chars):",
        rawText.slice(0, 300)
      );
      return {
        success: false,
        error: "Could not reach our mail service. Please WhatsApp us at +91 97252 52421.",
      };
    }

    if (data.success) {
      return { success: true };
    }

    console.error("Web3Forms API error:", data);
    return {
      success: false,
      error: data.message || "Failed to send. Please try again or WhatsApp us.",
    };
  } catch (err: unknown) {
    console.error("Contact form unexpected error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please WhatsApp us at +91 97252 52421.",
    };
  }
}
