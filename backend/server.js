const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);

// ==================================================
// HOME ROUTE
// ==================================================

app.get("/", (req, res) => {
    res.json({
        message: "TrustLens AI Backend is running!",
        status: "online"
    });
});

// ==================================================
// TEST ROUTE
// ==================================================

app.get("/api/test", (req, res) => {
    res.json({
        message: "TrustLens AI API is working!"
    });
});

// ==================================================
// MESSAGE / PHISHING ANALYZER
// ==================================================

app.post("/api/analyze", (req, res) => {

    const { message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({
            error: "Message is required"
        });
    }

    const text = message.toLowerCase();

    let trustScore = 100;
    let indicators = [];
    let category = "Low Risk";

    // ==================================================
    // PAYMENT
    // ==================================================

    if (
        text.includes("pay") ||
        text.includes("payment") ||
        text.includes("fee") ||
        text.includes("money") ||
        text.includes("deposit") ||
        text.includes("transfer") ||
        text.includes("send money")
    ) {
        trustScore -= 20;

        indicators.push(
            "Requests money or payment"
        );
    }

    // ==================================================
    // URGENCY
    // ==================================================

    if (
        text.includes("urgent") ||
        text.includes("immediately") ||
        text.includes("act now") ||
        text.includes("limited time") ||
        text.includes("hurry") ||
        text.includes("within 24 hours") ||
        text.includes("account will be blocked") ||
        text.includes("account will be suspended")
    ) {
        trustScore -= 20;

        indicators.push(
            "Uses urgency or pressure tactics"
        );
    }

    // ==================================================
    // SENSITIVE INFORMATION
    // ==================================================

    if (
        text.includes("password") ||
        text.includes("otp") ||
        text.includes("pin") ||
        text.includes("cvv") ||
        text.includes("verification code") ||
        text.includes("security code") ||
        text.includes("card number")
    ) {
        trustScore -= 30;

        indicators.push(
            "Requests sensitive or confidential information"
        );
    }

    // ==================================================
    // SUSPICIOUS LINKS
    // ==================================================

    if (
        text.includes("http://") ||
        text.includes("https://") ||
        text.includes("bit.ly") ||
        text.includes("tinyurl") ||
        text.includes("t.co") ||
        text.includes("click here") ||
        text.includes("open this link")
    ) {
        trustScore -= 20;

        indicators.push(
            "Contains a potentially suspicious link"
        );
    }

    // ==================================================
    // JOB SCAM
    // ==================================================

    const jobKeywords =
        text.includes("job") ||
        text.includes("selected") ||
        text.includes("salary") ||
        text.includes("interview") ||
        text.includes("recruiter") ||
        text.includes("joining") ||
        text.includes("work from home") ||
        text.includes("employment");

    const jobPaymentKeywords =
        text.includes("registration fee") ||
        text.includes("processing fee") ||
        text.includes("pay fee") ||
        text.includes("deposit") ||
        text.includes("training fee");

    if (
        jobKeywords &&
        jobPaymentKeywords
    ) {
        trustScore -= 30;

        category =
            "Potential Job Scam";

        indicators.push(
            "Possible recruitment scam pattern involving payment"
        );
    }

    // ==================================================
    // BANKING PHISHING
    // ==================================================

    const bankingKeywords =
        text.includes("bank") ||
        text.includes("banking") ||
        text.includes("credit card") ||
        text.includes("debit card") ||
        text.includes("net banking") ||
        text.includes("upi") ||
        text.includes("account");

    const credentialKeywords =
        text.includes("otp") ||
        text.includes("password") ||
        text.includes("pin") ||
        text.includes("cvv") ||
        text.includes("card number") ||
        text.includes("login");

    if (
        bankingKeywords &&
        credentialKeywords
    ) {
        trustScore -= 30;

        category =
            "Potential Banking Phishing";

        indicators.push(
            "Possible banking phishing pattern requesting sensitive credentials"
        );
    }

    // ==================================================
    // INVESTMENT SCAM
    // ==================================================

    if (
        text.includes("investment") ||
        text.includes("trading") ||
        text.includes("crypto") ||
        text.includes("double your money") ||
        text.includes("guaranteed returns") ||
        text.includes("guaranteed profit")
    ) {
        trustScore -= 25;

        category =
            "Potential Investment Scam";

        indicators.push(
            "Contains potential investment scam indicators"
        );
    }

    // ==================================================
    // LOTTERY SCAM
    // ==================================================

    if (
        text.includes("you won") ||
        text.includes("winner") ||
        text.includes("lottery") ||
        text.includes("prize") ||
        text.includes("lucky draw") ||
        text.includes("congratulations you have won")
    ) {
        trustScore -= 25;

        category =
            "Potential Lottery Scam";

        indicators.push(
            "Claims unexpected prize or lottery winnings"
        );
    }

    // ==================================================
    // ACCOUNT PHISHING
    // ==================================================

    if (
        (
            text.includes("verify your account") ||
            text.includes("confirm your account") ||
            text.includes("account verification")
        ) &&
        (
            text.includes("password") ||
            text.includes("otp") ||
            text.includes("login") ||
            text.includes("click")
        )
    ) {
        trustScore -= 30;

        category =
            "Potential Account Phishing";

        indicators.push(
            "Attempts to obtain account credentials through verification requests"
        );
    }

    // ==================================================
    // FAKE SECURITY ALERT
    // ==================================================

    if (
        text.includes("your account has been compromised") ||
        text.includes("suspicious login") ||
        text.includes("security alert") ||
        text.includes("unauthorized login")
    ) {
        trustScore -= 20;

        indicators.push(
            "Uses a security alert that may be intended to create panic"
        );
    }

    // ==================================================
    // MULTIPLE INDICATORS
    // ==================================================

    if (indicators.length >= 4) {
        trustScore -= 15;
    }

    // ==================================================
    // REMOVE DUPLICATES
    // ==================================================

    indicators = [
        ...new Set(indicators)
    ];

    // ==================================================
    // SCORE LIMIT
    // ==================================================

    trustScore = Math.max(
        0,
        Math.min(
            100,
            trustScore
        )
    );

    // ==================================================
    // RISK LEVEL
    // ==================================================

    let riskLevel;

    if (
        (
            category ===
                "Potential Banking Phishing" ||
            category ===
                "Potential Account Phishing"
        ) &&
        trustScore <= 70
    ) {
        riskLevel = "HIGH";
    }
    else if (
        trustScore <= 40
    ) {
        riskLevel = "HIGH";
    }
    else if (
        trustScore <= 70
    ) {
        riskLevel = "MEDIUM";
    }
    else {
        riskLevel = "LOW";
    }

    // ==================================================
    // RECOMMENDATION
    // ==================================================

    let recommendation;

    if (
        riskLevel === "HIGH"
    ) {
        recommendation =
            "Do not click suspicious links or share passwords, OTPs, PINs, or banking information. Verify the sender through an independently obtained official source.";
    }
    else if (
        riskLevel === "MEDIUM"
    ) {
        recommendation =
            "Proceed with caution. Do not provide personal or financial information until the sender and request have been independently verified.";
    }
    else {
        recommendation =
            "No major suspicious indicators were detected. However, this analysis cannot guarantee that the content is completely safe.";
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
        trustScore,
        riskLevel,
        category,
        indicators,
        recommendation
    });
});

// ==================================================
// URL SECURITY ANALYZER
// ==================================================

app.post("/api/analyze-url", (req, res) => {

    const { url } = req.body;

    if (
        !url ||
        url.trim() === ""
    ) {
        return res.status(400).json({
            error: "URL is required"
        });
    }

    let parsedURL;

    try {
        parsedURL =
            new URL(
                url.trim()
            );
    }
    catch (error) {
        return res.status(400).json({
            error: "Please enter a valid URL"
        });
    }

    let trustScore = 100;
    let indicators = [];
    let category = "Low Risk";

    const hostname =
        parsedURL.hostname.toLowerCase();

    const fullURL =
        url.toLowerCase();

    // ==================================================
    // HTTPS
    // ==================================================

    if (
        parsedURL.protocol !== "https:"
    ) {
        trustScore -= 20;

        indicators.push(
            "Website does not use HTTPS encryption"
        );
    }

    // ==================================================
    // IP ADDRESS
    // ==================================================

    const ipAddressPattern =
        /^(\d{1,3}\.){3}\d{1,3}$/;

    if (
        ipAddressPattern.test(
            hostname
        )
    ) {
        trustScore -= 30;

        indicators.push(
            "URL uses an IP address instead of a domain name"
        );

        category =
            "Potential Phishing Website";
    }

    // ==================================================
    // URL SHORTENER
    // ==================================================

    const shortenerDomains = [
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "is.gd",
        "cutt.ly"
    ];

    if (
        shortenerDomains.some(
            domain =>
                hostname === domain ||
                hostname.endsWith(
                    "." + domain
                )
        )
    ) {
        trustScore -= 25;

        indicators.push(
            "URL uses a link shortening service that hides the final destination"
        );

        category =
            "Potential Suspicious Link";
    }

    // ==================================================
    // CLOUDFLARE TUNNEL
    // ==================================================

    if (
        hostname.endsWith(
            ".trycloudflare.com"
        )
    ) {
        trustScore -= 35;

        indicators.push(
            "Website is hosted through a temporary Cloudflare Tunnel domain"
        );

        category =
            "Potential Phishing Website";
    }

    // ==================================================
    // @ SYMBOL
    // ==================================================

    if (
        url.includes("@")
    ) {
        trustScore -= 30;

        indicators.push(
            "URL contains an @ symbol that may obscure the actual destination"
        );

        category =
            "Potential Phishing Website";
    }

    // ==================================================
    // PUNYCODE
    // ==================================================

    if (
        hostname.includes("xn--")
    ) {
        trustScore -= 25;

        indicators.push(
            "Domain uses Punycode, which can sometimes be used for lookalike domains"
        );

        category =
            "Potential Suspicious Domain";
    }

    // ==================================================
    // SUSPICIOUS KEYWORDS
    // ==================================================

    const suspiciousKeywords = [
        "login",
        "signin",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "password",
        "confirm",
        "bank",
        "wallet",
        "payment",
        "auth",
        "credential"
    ];

    const foundKeywords =
        suspiciousKeywords.filter(
            keyword =>
                fullURL.includes(
                    keyword
                )
        );

    if (
        foundKeywords.length >= 2
    ) {
        trustScore -= 20;

        indicators.push(
            "URL contains multiple sensitive or security-related keywords"
        );

        category =
            "Potential Phishing Website";
    }

    // ==================================================
    // EXCESSIVE SUBDOMAINS
    // ==================================================

    const subdomainCount =
        hostname.split(".").length - 2;

    if (
        subdomainCount >= 3
    ) {
        trustScore -= 15;

        indicators.push(
            "URL contains an unusually high number of subdomains"
        );

        category =
            "Potential Suspicious Domain";
    }

    // ==================================================
    // EXCESSIVE HYPHENS
    // ==================================================

    const hyphenCount =
        (
            hostname.match(/-/g) ||
            []
        ).length;

    if (
        hyphenCount >= 3
    ) {
        trustScore -= 10;

        indicators.push(
            "Domain contains multiple hyphens"
        );
    }

    // ==================================================
    // SUSPICIOUS TLD
    // ==================================================

    const suspiciousTLDs = [
        ".xyz",
        ".top",
        ".click",
        ".work",
        ".buzz",
        ".gq",
        ".tk",
        ".ml",
        ".cf"
    ];

    if (
        suspiciousTLDs.some(
            tld =>
                hostname.endsWith(
                    tld
                )
        )
    ) {
        trustScore -= 15;

        indicators.push(
            "Domain uses a TLD frequently associated with suspicious websites"
        );

        category =
            "Potential Suspicious Domain";
    }

    // ==================================================
    // LONG URL
    // ==================================================

    if (
        url.length > 150
    ) {
        trustScore -= 10;

        indicators.push(
            "URL is unusually long and complex"
        );
    }

    // ==================================================
    // REDIRECT PARAMETERS
    // ==================================================

    const suspiciousParameters = [
        "redirect",
        "url=",
        "next=",
        "return=",
        "continue=",
        "dest=",
        "destination="
    ];

    if (
        suspiciousParameters.some(
            parameter =>
                fullURL.includes(
                    parameter
                )
        )
    ) {
        trustScore -= 10;

        indicators.push(
            "URL contains parameters commonly used for redirects"
        );
    }

    // ==================================================
    // REMOVE DUPLICATES
    // ==================================================

    indicators = [
        ...new Set(indicators)
    ];

    // ==================================================
    // SCORE LIMIT
    // ==================================================

    trustScore =
        Math.max(
            0,
            Math.min(
                100,
                trustScore
            )
        );

    // ==================================================
    // RISK LEVEL
    // ==================================================

    let riskLevel;

    if (
        category ===
            "Potential Phishing Website" &&
        trustScore <= 70
    ) {
        riskLevel = "HIGH";
    }
    else if (
        trustScore <= 40
    ) {
        riskLevel = "HIGH";
    }
    else if (
        trustScore <= 70
    ) {
        riskLevel = "MEDIUM";
    }
    else {
        riskLevel = "LOW";
    }

    // ==================================================
    // RECOMMENDATION
    // ==================================================

    let recommendation;

    if (
        riskLevel === "HIGH"
    ) {
        recommendation =
            "Avoid opening this website or entering personal information. Do not enter passwords, OTPs, PINs, banking details, or payment information.";
    }
    else if (
        riskLevel === "MEDIUM"
    ) {
        recommendation =
            "Proceed with caution. Verify the domain through an official source before entering personal or financial information.";
    }
    else {
        recommendation =
            "No major URL-based risk indicators were detected. However, this analysis cannot guarantee that the website is completely safe.";
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
        trustScore,
        riskLevel,
        category,
        indicators,
        recommendation,
        analyzedURL:
            url.trim()
    });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "TRUSTLENS AI BACKEND SERVER"
        );

        console.log(
            "======================================"
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "Message Analyzer: ENABLED"
        );

        console.log(
            "URL Analyzer: ENABLED"
        );

        console.log(
            "AI API: DISABLED"
        );

    }
);