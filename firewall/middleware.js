import { Sanitizer } from "./Sanitizer.js";

export function createFirewallMiddleware(firewallInstance) {
  const sanitizer = new Sanitizer();

  return async (req, res, next) => {
    try {
      const userInput = req.body?.message || "";
      const enableFirewall = req.body?.enableFirewall !== false;
      
      if (!userInput) {
        return res.status(400).json({ error: "No message provided" });
      }

      if (!enableFirewall) {
        console.log("🛡️ Firewall bypassed by user toggle.");
        req.body.wasSanitized = false;
        req.body.firewallScore = 0;
        return next();
      }

      console.log("🛡️ Firewall scanning input...");
      const scanResult = await firewallInstance.scan(userInput);
      console.log("🛡️ Scan Result:", scanResult);

      if (scanResult.status === "blocked") {
        return res.json({
          reply: "🚫 Blocked by firewall",
          risk: scanResult.score,
          blocked: true,
          details: scanResult.details
        });
      }

      if (scanResult.status === "suspicious") {
        console.log("⚠️ Prompt is suspicious. Sanitizing...");
        const sanitizedInput = sanitizer.sanitize(userInput);
        
        // Update the request body so downstream routes use the sanitized text
        req.body.message = sanitizedInput;
        req.body.wasSanitized = true;
        req.body.sanitizedPrompt = sanitizedInput;
        req.body.firewallScore = scanResult.score;
      } else {
        req.body.wasSanitized = false;
        req.body.firewallScore = scanResult.score;
      }

      next();
    } catch (err) {
      console.error("💥 Firewall Middleware Error:", err);
      // In case of middleware failure, fail securely by returning 500
      return res.status(500).json({
        error: "Internal Firewall Error"
      });
    }
  };
}
