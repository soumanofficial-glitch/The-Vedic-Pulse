
export const trackMetaEvent = async (eventName: string, userData: any = {}, customData: any = {}) => {
  try {
    // Only track if not in development or if explicitly allowed
    // But for this app, we'll just attempt it.
    
    const response = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        userData,
        customData,
      }),
    });

    if (!response.ok) {
      console.warn("[META] Client-side track request failed");
    }
  } catch (error) {
    console.error("[META] Error tracking event:", error);
  }
};
