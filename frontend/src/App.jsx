import { useState } from "react";
import "./App.css";
import Tesseract from "tesseract.js";

const API = import.meta.env.VITE_API_URL || "https://trust-lens-vgtl.onrender.com";

function App() {
  // ==================================================
  // NAVIGATION
  // ==================================================

  const [activePage, setActivePage] = useState("analyze");

  // ==================================================
  // ANALYZER MODE
  // ==================================================

  const [activeMode, setActiveMode] = useState("message");

  // ==================================================
  // MESSAGE ANALYZER
  // ==================================================

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // URL ANALYZER
  // ==================================================

  const [url, setUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // ==================================================
  // SCREENSHOT ANALYZER
  // ==================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");

  // ==================================================
  // TRUST REPORT
  // ==================================================

  const [result, setResult] = useState(null);

  // ==================================================
  // HISTORY
  // ==================================================

  const [history, setHistory] = useState([]);

  // ==================================================
  // HARDcoded AI ASSISTANT
  // ==================================================

  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! I'm your TrustLens AI Safety Assistant. I can help you understand phishing, scams, suspicious websites, online safety and cybersecurity.\n\nYou can ask me questions like:\n\n• What is phishing?\n• How can I identify a fake website?\n• What should I do if I clicked a suspicious link?\n• How can I protect my account?",
    },
  ]);

  // ==================================================
  // RESET ASSISTANT
  // ==================================================

  const resetAssistantMessages = () => {
    setAssistantMessages([
      {
        sender: "ai",
        text:
          "Hi! I'm your TrustLens AI Safety Assistant. I can help you understand phishing, scams, suspicious websites, online safety and cybersecurity.\n\nWhat would you like to know?",
      },
    ]);
  };

  // ==================================================
  // HARDCODED ASSISTANT REPLIES
  // ==================================================

  const getHardcodedAssistantReply = (question, analysis) => {
    const text = question.toLowerCase();

    if (text.includes("what is phishing")) {
      return "Phishing is a cyber scam where attackers pretend to be a trusted person, company, bank, or organization to trick you into sharing sensitive information such as passwords, OTPs, PINs, or banking details. It can happen through emails, SMS, WhatsApp messages, phone calls, or fake websites.";
    }

    if (
      text.includes("fake website") ||
      text.includes("suspicious website")
    ) {
      return "A fake website often looks like a real one but may have a strange domain name, spelling mistakes, unusual subdomains, or requests for passwords and payment details. Always check the website carefully and verify it through the official source.";
    }

    if (
      text.includes("clicked") &&
      text.includes("suspicious link")
    ) {
      return "If you clicked a suspicious link, close it immediately and do not enter any personal information. If you entered a password, change it from the official website. If you shared banking details or an OTP, contact your bank through its official customer support channel.";
    }

    if (
      text.includes("protect my account") ||
      text.includes("secure my account") ||
      text.includes("account security")
    ) {
      return "To protect your account, use a strong unique password, enable two-factor authentication, never share OTPs or PINs, keep your devices updated, and avoid clicking unexpected links.";
    }

    if (text.includes("what should i do")) {
      if (analysis) {
        return (
          analysis.recommendation ||
          "Do not share sensitive information or click suspicious links. Verify the sender or website through an official source before taking action."
        );
      }

      return "Do not click suspicious links, share passwords, OTPs, or banking information. Verify the sender or website through an official source before taking action.";
    }

    if (
      text.includes("why is this suspicious") ||
      text.includes("why suspicious")
    ) {
      if (analysis) {
        const indicators =
          analysis.indicators &&
          analysis.indicators.length > 0
            ? analysis.indicators.join(", ")
            : "No major suspicious indicators were detected.";

        return `According to your TrustLens analysis, the trust score is ${analysis.trustScore}/100 and the risk level is ${analysis.riskLevel}. The detected category is ${analysis.category}. The main indicators are: ${indicators}.`;
      }

      return "I can explain why something is suspicious after you analyze a message, URL, or screenshot. You can also ask me general questions like what phishing is or how to stay safe online.";
    }

    if (text.includes("otp")) {
      return "Never share your OTP with anyone. Banks and legitimate services generally do not ask you to disclose your OTP over phone calls, messages, or email.";
    }

    if (text.includes("password")) {
      return "Use a long, unique password for every important account. Consider using a password manager and enable two-factor authentication whenever available.";
    }

    if (text.includes("social engineering")) {
      return "Social engineering is a technique where attackers manipulate people into revealing sensitive information or performing actions. Common examples include phishing emails, fake customer support calls, job scams, and impersonation scams.";
    }

    if (
      text.includes("job scam") ||
      text.includes("fake job")
    ) {
      return "Fake job scams often promise high salaries or easy work and may ask applicants to pay registration, processing, training, or security fees. Be cautious of job offers that require upfront payments or request sensitive information before proper verification.";
    }

    if (
      text.includes("scam") ||
      text.includes("online fraud")
    ) {
      return "A scam is an attempt to trick someone into giving away money, personal information, account access, or other valuable information. Common scams include phishing, fake job offers, investment scams, lottery scams, loan scams, and fake customer support messages.";
    }

    if (text.includes("investment")) {
      return "Investment scams often promise guaranteed profits, unusually high returns, or quick wealth. Be careful if someone pressures you to invest immediately or asks you to transfer money to an unknown account.";
    }

    if (text.includes("lottery") || text.includes("prize")) {
      return "Lottery scams usually claim that you have won a prize even though you never entered a legitimate contest. Scammers may ask you to pay a fee or provide banking information to receive the prize.";
    }

    if (text.includes("bank")) {
      return "If a message claims to be from your bank, do not use links provided in unexpected messages. Open your bank's official app or manually visit its official website. Never share your OTP, PIN, CVV, or password.";
    }

    return "I can help you with phishing, scams, suspicious websites, suspicious messages, social engineering, account security, OTP safety, passwords, and digital safety. Try asking: What is phishing? How can I identify a fake website? What should I do if I clicked a suspicious link?";
  };

  // ==================================================
  // ADD TO HISTORY
  // ==================================================

  const addToHistory = (data) => {
    const historyItem = {
      id: Date.now(),
      type: data.type,
      input: data.input,
      trustScore: data.trustScore,
      riskLevel: data.riskLevel,
      category: data.category,
      indicators: data.indicators || [],
      recommendation: data.recommendation,
      extractedText: data.extractedText || "",
      analyzedURL: data.analyzedURL || "",
      date: new Date().toLocaleString(),
    };

    setHistory((previousHistory) => [
      historyItem,
      ...previousHistory,
    ]);
  };

  // ==================================================
  // MESSAGE ANALYZER
  // ==================================================

  const analyzeMessage = async () => {
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Message analysis failed"
        );
      }

      setResult(data);

      // Save analysis to history
      addToHistory({
        type: "Message",
        input: message.trim(),
        trustScore: data.trustScore,
        riskLevel: data.riskLevel,
        category: data.category,
        indicators: data.indicators,
        recommendation: data.recommendation,
      });
    } catch (error) {
      console.error("Message analysis error:", error);

      if (error.response) {
        console.log("Error response data:", error.response.data || error.response);
      }

      alert(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // URL ANALYZER
  // ==================================================

  const analyzeURL = async () => {
    if (!url.trim()) {
      return;
    }

    setUrlLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API}/api/analyze-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "URL analysis failed"
        );
      }

      setResult(data);

      // Save URL analysis to history
      addToHistory({
        type: "Website",
        input: url.trim(),
        trustScore: data.trustScore,
        riskLevel: data.riskLevel,
        category: data.category,
        indicators: data.indicators,
        recommendation: data.recommendation,
        analyzedURL: data.analyzedURL,
      });
    } catch (error) {
      console.error("URL analysis error:", error);

      if (error.response) {
        console.log("Error response data:", error.response.data || error.response);
      }

      alert(
        error.message || "Something went wrong"
      );
    } finally {
      setUrlLoading(false);
    }
  };

  // ==================================================
  // SCREENSHOT SELECTION
  // ==================================================

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Image size must be less than 10 MB."
      );
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const previewURL =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewURL);
    setExtractedText("");
    setResult(null);
    setOcrProgress(0);
  };

  // ==================================================
  // SCREENSHOT OCR + ANALYSIS
  // ==================================================

  const analyzeScreenshot = async () => {
    if (!selectedImage) {
      alert(
        "Please select a screenshot first."
      );
      return;
    }

    setOcrLoading(true);
    setResult(null);
    setExtractedText("");
    setOcrProgress(0);

    try {
      const { data } =
        await Tesseract.recognize(
          selectedImage,
          "eng",
          {
            logger: (info) => {
              if (
                info.status ===
                "recognizing text"
              ) {
                setOcrProgress(
                  Math.round(
                    info.progress * 100
                  )
                );
              }
            },
          }
        );

      const text =
        data.text.trim();

      if (!text) {
        alert(
          "No readable text was detected in this screenshot."
        );
        return;
      }

      setExtractedText(text);

      const response = await fetch(
        `${API}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const analysis = await response.json();

      if (!response.ok) {
        throw new Error(
          analysis.error || analysis.message || "Screenshot analysis failed"
        );
      }

      setResult({
        ...analysis,
        sourceType: "Screenshot",
        extractedText: text,
      });

      // Save screenshot analysis to history
      addToHistory({
        type: "Screenshot",
        input: text,
        trustScore:
          analysis.trustScore,
        riskLevel:
          analysis.riskLevel,
        category:
          analysis.category,
        indicators:
          analysis.indicators,
        recommendation:
          analysis.recommendation,
        extractedText: text,
      });
    } catch (error) {
      console.error("Screenshot analysis error:", error);

      if (error.response) {
        console.log("Error response data:", error.response.data || error.response);
      }

      alert(
        error.message || "Something went wrong"
      );
    } finally {
      setOcrLoading(false);
    }
  };

  // ==================================================
  // CLEAR CURRENT ANALYSIS
  // ==================================================

  const clearAnalysis = () => {
    setMessage("");
    setUrl("");
    setResult(null);

    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImagePreview("");
    setExtractedText("");
    setOcrProgress(0);

    resetAssistantMessages();
  };

  // ==================================================
  // OPEN HISTORY RESULT
  // ==================================================

  const openHistoryResult = (item) => {
    setResult({
      trustScore: item.trustScore,
      riskLevel: item.riskLevel,
      category: item.category,
      indicators: item.indicators,
      recommendation:
        item.recommendation,
      sourceType: item.type,
      extractedText:
        item.extractedText,
      analyzedURL:
        item.analyzedURL,
    });

    setActivePage("analyze");

    if (item.type === "Message") {
      setActiveMode("message");
      setMessage(item.input);
    }

    if (item.type === "Website") {
      setActiveMode("website");
      setUrl(item.input);
    }

    if (item.type === "Screenshot") {
      setActiveMode("image");
      setExtractedText(
        item.extractedText
      );
    }
  };

  // ==================================================
  // HARDcoded AI ASSISTANT
  // ==================================================

  const sendAssistantMessage = (
    customQuestion = null
  ) => {
    const question = (
      customQuestion ||
      assistantInput
    ).trim();

    if (
      !question ||
      assistantLoading
    ) {
      return;
    }

    setAssistantMessages(
      (previousMessages) => [
        ...previousMessages,
        {
          sender: "user",
          text: question,
        },
      ]
    );

    setAssistantInput("");
    setAssistantLoading(true);

    setTimeout(() => {
      const reply =
        getHardcodedAssistantReply(
          question,
          result
            ? {
                trustScore:
                  result.trustScore,
                riskLevel:
                  result.riskLevel,
                category:
                  result.category,
                indicators:
                  result.indicators ||
                  [],
                recommendation:
                  result.recommendation,
                extractedText:
                  result.extractedText ||
                  extractedText ||
                  "",
                analyzedURL:
                  result.analyzedURL ||
                  "",
              }
            : null
        );

      setAssistantMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            sender: "ai",
            text: reply,
          },
        ]
      );

      setAssistantLoading(false);
    }, 500);
  };

  // ==================================================
  // ASSISTANT ENTER KEY
  // ==================================================

  const handleAssistantKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendAssistantMessage();
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="app">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🛡️
          </div>

          <div>
            <h2>TrustLens</h2>
            <span>
              Digital Trust Analyzer
            </span>
          </div>

        </div>

        <div className="nav-links">

          <button
            className={
              activePage === "analyze"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("analyze")
            }
          >
            Analyze
          </button>

          <button
            className={
              activePage === "history"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("history")
            }
          >
            History
          </button>

          <button
            className={
              activePage === "about"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("about")
            }
          >
            About
          </button>

        </div>

        <button
          className="assistant-nav-button"
          onClick={() =>
            setShowAssistant(true)
          }
        >
          <span>✦</span>
          AI Assistant
        </button>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="main-container">

        {/* ==================================================
            HISTORY PAGE
        ================================================== */}

        {activePage === "history" && (

          <section className="history-section">

            <div className="report-header">

              <div>

                <span className="section-label">
                  ANALYSIS HISTORY
                </span>

                <h2>
                  Your Previous Trust Reports
                </h2>

                <p>
                  Review your previous message,
                  website and screenshot analyses.
                </p>

              </div>

              {history.length > 0 && (

                <button
                  className="clear-button"
                  onClick={() =>
                    setHistory([])
                  }
                >
                  Clear History
                </button>

              )}

            </div>

            {history.length === 0 ? (

              <div className="empty-history">

                <div className="empty-history-icon">
                  📋
                </div>

                <h3>
                  No Analysis History
                </h3>

                <p>
                  Your analyzed messages,
                  websites and screenshots
                  will appear here.
                </p>

                <button
                  className="analyze-button"
                  onClick={() =>
                    setActivePage(
                      "analyze"
                    )
                  }
                >
                  Start New Analysis
                </button>

              </div>

            ) : (

              <div className="history-list">

                {history.map(
                  (item) => (

                    <div
                      className="history-card"
                      key={item.id}
                      onClick={() =>
                        openHistoryResult(
                          item
                        )
                      }
                    >

                      <div className="history-card-header">

                        <div>

                          <span className="card-label">
                            {item.type.toUpperCase()} ANALYSIS
                          </span>

                          <h3>
                            {item.category}
                          </h3>

                          <small>
                            {item.date}
                          </small>

                        </div>

                        <div
                          className={`risk-badge ${
                            item.riskLevel?.toLowerCase() ||
                            ""
                          }`}
                        >

                          {item.riskLevel ===
                            "HIGH" &&
                            "🔴"}

                          {item.riskLevel ===
                            "MEDIUM" &&
                            "🟡"}

                          {item.riskLevel ===
                            "LOW" &&
                            "🟢"}

                          {" "}
                          {item.riskLevel} RISK

                        </div>

                      </div>

                      <div className="history-score">

                        <strong>
                          {item.trustScore}
                        </strong>

                        <span>
                          /100 Trust Score
                        </span>

                      </div>

                      <div className="history-input">

                        <strong>
                          Analyzed Content:
                        </strong>

                        <p>

                          {item.input.length >
                          250
                            ? item.input.substring(
                                0,
                                250
                              ) + "..."
                            : item.input}

                        </p>

                      </div>

                      {item.indicators &&
                        item.indicators.length >
                          0 && (

                          <div className="history-indicators">

                            <strong>
                              Detected Indicators:
                            </strong>

                            <ul>

                              {item.indicators.map(
                                (
                                  indicator,
                                  index
                                ) => (

                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    ⚠️{" "}
                                    {indicator}
                                  </li>

                                )
                              )}

                            </ul>

                          </div>

                        )}

                      <div className="history-recommendation">

                        <strong>
                          Recommended Action:
                        </strong>

                        <p>
                          {
                            item.recommendation
                          }
                        </p>

                      </div>

                      <button
                        className="history-view-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openHistoryResult(
                            item
                          );
                        }}
                      >
                        View Full Report →
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

        {/* ==================================================
            ABOUT PAGE
        ================================================== */}

        {activePage === "about" && (

          <section className="about-section">

            <div className="status-badge">

              <span className="status-dot"></span>

              About TrustLens

            </div>

            <h1>

              Digital safety,

              <br />

              <span>
                made understandable.
              </span>

            </h1>

            <p>

              TrustLens is a digital trust
              analyzer designed to help users
              identify suspicious messages,
              websites and screenshots.

            </p>

            <div className="about-grid">

              <div className="category-card">

                <div className="category-icon">
                  📧
                </div>

                <h3>
                  Message Analysis
                </h3>

                <p>

                  Detect phishing, job scams,
                  banking scams, investment scams
                  and other suspicious patterns.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  🌐
                </div>

                <h3>
                  Website Analysis
                </h3>

                <p>

                  Check URLs for suspicious
                  domains, shorteners, IP addresses
                  and other risk indicators.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  📷
                </div>

                <h3>
                  Screenshot Analysis
                </h3>

                <p>

                  Extract text from screenshots
                  using OCR and analyze the
                  detected content.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  ✦
                </div>

                <h3>
                  Hardcoded Safety Assistant
                </h3>

                <p>

                  Get instant answers about
                  phishing, scams, passwords,
                  OTP safety and online security.

                </p>

              </div>

            </div>

            <button
              className="analyze-button"
              onClick={() =>
                setActivePage("analyze")
              }
            >
              Start Analysis
            </button>

          </section>

        )}

        {/* ==================================================
            ANALYZE PAGE
        ================================================== */}

        {activePage === "analyze" && (

          <>

            {/* ==================================================
                HERO
            ================================================== */}

            <section className="hero-section">

              <div className="status-badge">

                <span className="status-dot"></span>

                Digital Safety Analyzer

              </div>

              <h1>

                See the risk.

                <br />

                <span>
                  Understand the threat.
                </span>

              </h1>

              <p>

                Analyze suspicious messages,
                websites and screenshots with
                TrustLens. Get clear explanations
                and practical safety recommendations
                before you take action.

              </p>

            </section>

            {/* ==================================================
                ANALYZER CARD
            ================================================== */}

            <section className="analyzer-card">

              <div className="mode-selector">

                <button
                  className={
                    activeMode === "message"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "message"
                    )
                  }
                >

                  <span className="mode-icon">
                    📧
                  </span>

                  <div>

                    <strong>
                      Message
                    </strong>

                    <small>
                      Email, SMS, WhatsApp
                    </small>

                  </div>

                </button>

                <button
                  className={
                    activeMode === "website"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "website"
                    )
                  }
                >

                  <span className="mode-icon">
                    🌐
                  </span>

                  <div>

                    <strong>
                      Website
                    </strong>

                    <small>
                      Analyze a URL
                    </small>

                  </div>

                </button>

                <button
                  className={
                    activeMode === "image"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "image"
                    )
                  }
                >

                  <span className="mode-icon">
                    📷
                  </span>

                  <div>

                    <strong>
                      Screenshot
                    </strong>

                    <small>
                      Scan an image
                    </small>

                  </div>

                </button>

              </div>

              <div className="input-section">

                {/* ==================================================
                    MESSAGE MODE
                ================================================== */}

                {activeMode === "message" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious message
                        </h3>

                        <p>

                          Paste an email, SMS,
                          WhatsApp message, job offer
                          or suspicious content.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 Private Analysis
                      </span>

                    </div>

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value
                        )
                      }
                      placeholder="Paste the suspicious message here..."
                    />

                    <div className="input-footer">

                      <span>
                        {message.length} characters
                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeMessage
                        }
                        disabled={
                          loading ||
                          !message.trim()
                        }
                      >

                        {loading ? (

                          <>

                            <span className="spinner"></span>

                            Analyzing...

                          </>

                        ) : (

                          <>
                            🔍 Analyze with TrustLens
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

                {/* ==================================================
                    WEBSITE MODE
                ================================================== */}

                {activeMode === "website" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious website
                        </h3>

                        <p>

                          Enter a website URL and
                          TrustLens will check for
                          suspicious URL indicators.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 Safe URL Analysis
                      </span>

                    </div>

                    <div className="url-input-wrapper">

                      <span className="url-icon">
                        🌐
                      </span>

                      <input
                        type="text"
                        value={url}
                        onChange={(e) =>
                          setUrl(
                            e.target.value
                          )
                        }
                        placeholder="https://example.com"
                      />

                    </div>

                    <div className="input-footer">

                      <span>
                        URL structure analysis
                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeURL
                        }
                        disabled={
                          urlLoading ||
                          !url.trim()
                        }
                      >

                        {urlLoading ? (

                          <>

                            <span className="spinner"></span>

                            Analyzing URL...

                          </>

                        ) : (

                          <>
                            🔍 Analyze Website
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

                {/* ==================================================
                    SCREENSHOT MODE
                ================================================== */}

                {activeMode === "image" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious screenshot
                        </h3>

                        <p>

                          Upload a screenshot of a
                          suspicious SMS, email,
                          WhatsApp message or scam.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 OCR Analysis
                      </span>

                    </div>

                    <label className="screenshot-upload">

                      {!imagePreview ? (

                        <>

                          <div className="upload-icon">
                            📷
                          </div>

                          <h3>
                            Upload Screenshot
                          </h3>

                          <p>
                            Click here to select an image
                          </p>

                          <small>
                            PNG, JPG or JPEG • Max 10 MB
                          </small>

                        </>

                      ) : (

                        <div className="image-preview-container">

                          <img
                            src={imagePreview}
                            alt="Selected screenshot"
                            className="image-preview"
                          />

                        </div>

                      )}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={
                          handleImageSelect
                        }
                        hidden
                      />

                    </label>

                    {ocrLoading && (

                      <div className="ocr-progress">

                        <div>

                          <span>
                            🔍 Reading screenshot...
                          </span>

                          <strong>
                            {ocrProgress}%
                          </strong>

                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${ocrProgress}%`,
                            }}
                          />

                        </div>

                      </div>

                    )}

                    {extractedText && (

                      <div className="extracted-text-card">

                        <span className="card-label">
                          EXTRACTED TEXT
                        </span>

                        <p>
                          {extractedText}
                        </p>

                      </div>

                    )}

                    <div className="input-footer">

                      <span>

                        {selectedImage
                          ? selectedImage.name
                          : "No screenshot selected"}

                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeScreenshot
                        }
                        disabled={
                          ocrLoading ||
                          !selectedImage
                        }
                      >

                        {ocrLoading ? (

                          <>

                            <span className="spinner"></span>

                            Scanning Screenshot...

                          </>

                        ) : (

                          <>
                            🔍 Scan Screenshot
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

              </div>

            </section>

            {/* ==================================================
                TRUST REPORT
            ================================================== */}

            {result && (

              <section className="report-section">

                <div className="report-header">

                  <div>

                    <span className="section-label">
                      ANALYSIS COMPLETE
                    </span>

                    <h2>
                      Your Trust Report
                    </h2>

                    {result.sourceType && (

                      <small>
                        Source:{" "}
                        {result.sourceType}
                      </small>

                    )}

                  </div>

                  <button
                    className="clear-button"
                    onClick={
                      clearAnalysis
                    }
                  >
                    New Analysis
                  </button>

                </div>

                <div className="report-grid">

                  <div className="score-card">

                    <span className="card-label">
                      TRUST SCORE
                    </span>

                    <div className="score-circle">

                      <div>

                        <strong>
                          {result.trustScore}
                        </strong>

                        <span>
                          /100
                        </span>

                      </div>

                    </div>

                    <div
                      className={`risk-badge ${
                        result.riskLevel?.toLowerCase() ||
                        ""
                      }`}
                    >

                      {result.riskLevel ===
                        "HIGH" &&
                        "🔴"}

                      {result.riskLevel ===
                        "MEDIUM" &&
                        "🟡"}

                      {result.riskLevel ===
                        "LOW" &&
                        "🟢"}

                      {" "}
                      {result.riskLevel} RISK

                    </div>

                  </div>

                  <div className="category-card">

                    <span className="card-label">
                      DETECTED CATEGORY
                    </span>

                    <div className="category-icon">
                      ⚠️
                    </div>

                    <h3>
                      {result.category}
                    </h3>

                    <p>

                      TrustLens detected
                      patterns that may
                      indicate potentially
                      unsafe content.

                    </p>

                  </div>

                  <div className="indicators-card">

                    <span className="card-label">
                      RISK INDICATORS
                    </span>

                    <div className="indicator-list">

                      {result.indicators &&
                      result.indicators.length >
                        0 ? (

                        result.indicators.map(
                          (
                            indicator,
                            index
                          ) => (

                            <div
                              className="indicator"
                              key={
                                index
                              }
                            >

                              <span>
                                ⚠️
                              </span>

                              <p>
                                {indicator}
                              </p>

                            </div>

                          )
                        )

                      ) : (

                        <div className="safe-message">

                          <span>
                            ✓
                          </span>

                          <p>
                            No major suspicious
                            indicators detected.
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                </div>

                <div className="recommendation-card">

                  <div className="recommendation-icon">
                    🛡️
                  </div>

                  <div>

                    <span className="card-label">
                      RECOMMENDED ACTION
                    </span>

                    <p>
                      {result.recommendation}
                    </p>

                  </div>

                </div>

                {result.extractedText && (

                  <div className="extracted-text-card">

                    <span className="card-label">
                      ANALYSIS EVIDENCE
                    </span>

                    <p>
                      {result.extractedText}
                    </p>

                  </div>

                )}

                {/* ==================================================
                    ASSISTANT CTA
                ================================================== */}

                <div className="assistant-cta">

                  <div className="assistant-avatar">
                    ✦
                  </div>

                  <div className="assistant-text">

                    <h3>
                      Need help understanding this result?
                    </h3>

                    <p>

                      Ask the TrustLens Safety
                      Assistant about the threat,
                      next steps or how to stay safe.

                    </p>

                  </div>

                  <button
                    className="ask-button"
                    onClick={() =>
                      setShowAssistant(
                        true
                      )
                    }
                  >
                    Ask TrustLens Assistant →
                  </button>

                </div>

              </section>

            )}

          </>

        )}

      </main>

      {/* ==================================================
          FLOATING ASSISTANT BUTTON
      ================================================== */}

      {!showAssistant && (

        <button
          className="floating-assistant"
          onClick={() =>
            setShowAssistant(
              true
            )
          }
        >

          <span>
            ✦
          </span>

          <div>

            <strong>
              TrustLens AI
            </strong>

            <small>
              Ask me anything
            </small>

          </div>

        </button>

      )}

      {/* ==================================================
          HARDCODED AI ASSISTANT PANEL
      ================================================== */}

      {showAssistant && (

        <div className="assistant-panel">

          <div className="assistant-header">

            <div className="assistant-profile">

              <div className="assistant-avatar">
                ✦
              </div>

              <div>

                <strong>
                  TrustLens AI
                </strong>

                <span>
                  Digital Safety Assistant
                </span>

              </div>

            </div>

            <button
              className="close-assistant"
              onClick={() =>
                setShowAssistant(
                  false
                )
              }
            >
              ×
            </button>

          </div>

          <div className="assistant-messages">

            {assistantMessages.map(
              (chat, index) => (

                <div
                  key={index}
                  className={
                    chat.sender === "user"
                      ? "user-message"
                      : "ai-message"
                  }
                >

                  {chat.sender === "ai" && (

                    <div className="message-icon">
                      ✦
                    </div>

                  )}

                  <div>

                    <p>
                      {chat.text}
                    </p>

                  </div>

                </div>

              )
            )}

            {assistantLoading && (

              <div className="ai-message">

                <div className="message-icon">
                  ✦
                </div>

                <div className="typing-indicator">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}

          </div>

          <div className="assistant-suggestions">

            <button
              onClick={() =>
                sendAssistantMessage(
                  "What is phishing?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              What is phishing?
            </button>

            <button
              onClick={() =>
                sendAssistantMessage(
                  "What should I do?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              What should I do?
            </button>

            <button
              onClick={() =>
                sendAssistantMessage(
                  "How can I verify this?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              How can I verify this?
            </button>

          </div>

          <div className="assistant-input">

            <input
              type="text"
              value={assistantInput}
              onChange={(e) =>
                setAssistantInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleAssistantKeyDown
              }
              placeholder="Ask TrustLens AI..."
              disabled={
                assistantLoading
              }
            />

            <button
              onClick={() =>
                sendAssistantMessage()
              }
              disabled={
                assistantLoading ||
                !assistantInput.trim()
              }
            >
              ↑
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;