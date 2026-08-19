import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudSun,
  FileImage,
  Leaf,
  Loader2,
  LogIn,
  Menu,
  Sprout,
  Upload,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { AgroGuardResult } from "@/lib/agroguard-analysis.server";

function AgroGuardLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="agro-logo" aria-label="FarmX AI AgroGuard">
      <span className="agro-logo-mark">
        <Sprout size={compact ? 17 : 22} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span>
          <b>FarmX</b> <em>AI</em>
          <small>AGROGUARD</small>
        </span>
      )}
    </div>
  );
}

export function AgroGuardHome() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<AgroGuardResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const chooseFile = (next: File | null) => {
    if (!next) return;
    setError("");
    setResult(null);
    if (!next.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, or WebP crop image.");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };
  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/agroguard/analyze", { method: "POST", body });
      const payload = (await response.json()) as { result?: AgroGuardResult; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error || "Analysis failed.");
      setResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not complete the analysis.");
    } finally {
      setLoading(false);
    }
  };
  const confidenceTone = result
    ? result.confidence >= 80
      ? "high"
      : result.confidence >= 60
        ? "medium"
        : "low"
    : "";

  return (
    <div className="agro-app">
      <header className="agro-topbar">
        <div className="agro-topbar-inner">
          <button className="agro-icon-button" aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <AgroGuardLogo />
          <Link to="/auth" className="agro-login">
            <LogIn size={16} /> Sign in
          </Link>
        </div>
      </header>
      <main className="agro-main">
        <section className="agro-welcome">
          <div>
            <span className="agro-eyebrow">AL-MIZAN AGRICULTURAL SOLUTIONS</span>
            <h1>
              Protect every harvest
              <br />
              <span>with clearer insight.</span>
            </h1>
            <p>
              AgroGuard uses real AI vision to provide preliminary crop-health guidance for farmers.
              Start with a clear tomato leaf photo.
            </p>
          </div>
          <div className="agro-welcome-art">
            <Leaf size={100} strokeWidth={1.2} />
            <span>
              Crop intelligence
              <br />
              for the field
            </span>
          </div>
        </section>

        <nav className="agro-section-nav" aria-label="AgroGuard sections">
          <a className="active" href="#crop-health">
            <Leaf size={16} /> Crop Health
          </a>
          <a href="#weather">
            <CloudSun size={16} /> Weather
          </a>
          <a href="#ask">
            <Sprout size={16} /> Ask AgroGuard
          </a>
          <a href="#farm">
            <FileImage size={16} /> My Farm
          </a>
        </nav>

        <section id="crop-health" className="agro-analysis-grid">
          <div className="agro-card agro-upload-card">
            <div className="agro-card-heading">
              <div>
                <span className="agro-kicker">01 · CROP HEALTH</span>
                <h2>Analyze your crop</h2>
              </div>
              <span className="agro-crop-pill">
                <Leaf size={13} /> Tomato
              </span>
            </div>
            <p className="agro-muted">
              Take a clear photo of a tomato leaf or upload an existing image. AgroGuard will look
              for visible signs and return preliminary guidance.
            </p>
            {!preview ? (
              <div className="agro-dropzone">
                <div className="agro-upload-icon">
                  <Upload size={24} />
                </div>
                <strong>Bring a crop photo</strong>
                <span>JPG, PNG or WebP · up to 10 MB</span>
                <div className="agro-upload-actions">
                  <button onClick={() => inputRef.current?.click()} className="agro-primary">
                    <Upload size={16} /> Upload photo
                  </button>
                  <label className="agro-secondary">
                    <Leaf size={16} /> Take photo
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={(e) => chooseFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="agro-preview-wrap">
                <div className="agro-preview">
                  <img src={preview} alt="Selected tomato crop" />
                  <button onClick={clearFile} aria-label="Remove image">
                    <X size={16} />
                  </button>
                </div>
                <div className="agro-preview-meta">
                  <span>Tomato leaf image ready</span>
                  <button onClick={() => inputRef.current?.click()}>Retake / replace</button>
                </div>
                <button
                  disabled={loading}
                  onClick={analyze}
                  className="agro-primary agro-analyze-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="agro-spin" size={17} /> Analyzing your crop...
                    </>
                  ) : (
                    <>
                      Analyze with AgroGuard <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            )}
            {error && (
              <div className="agro-error">
                <AlertTriangle size={17} /> {error}
              </div>
            )}
          </div>

          <div className="agro-card agro-result-card">
            <span className="agro-kicker">02 · AI RESULT</span>
            {!result && !loading && (
              <div className="agro-empty-result">
                <div className="agro-result-orbit">
                  <Sprout size={29} />
                </div>
                <h3>Your crop insight will appear here</h3>
                <p>Upload a clear tomato leaf image to receive a real Gemini vision analysis.</p>
              </div>
            )}
            {loading && (
              <div className="agro-empty-result">
                <Loader2 className="agro-spin" size={34} />
                <h3>Analyzing your crop...</h3>
                <p>
                  AgroGuard AI is examining visible crop-health signals. This may take a few
                  seconds.
                </p>
              </div>
            )}
            {result && (
              <div className="agro-result-content">
                <div className={`agro-confidence ${confidenceTone}`}>
                  <span>Confidence</span>
                  <strong>{result.confidence}%</strong>
                </div>
                <div className="agro-condition">
                  <span className="agro-result-label">Possible condition</span>
                  <h3>{result.condition}</h3>
                  <div className="agro-tags">
                    <span>Severity: {result.severity}</span>
                    <span>Crop: {result.crop}</span>
                  </div>
                </div>
                <div className="agro-observations">
                  <span className="agro-result-label">What we observed</span>
                  {result.observations.map((item, i) => (
                    <p key={i}>
                      <CheckCircle2 size={15} /> {item}
                    </p>
                  ))}
                </div>
                <div className="agro-guidance">
                  <span className="agro-result-label">Preliminary guidance</span>
                  <p>{result.recommendation}</p>
                </div>
                <div className={`agro-warning ${result.uncertain ? "urgent" : ""}`}>
                  <AlertTriangle size={18} />
                  <p>
                    <b>{result.uncertain ? "Low confidence" : "Important"}</b>
                    <br />
                    AI analysis is preliminary and should not replace professional agricultural
                    diagnosis.{" "}
                    {result.expert_required
                      ? "Please consult an agricultural expert if symptoms are severe, unclear, or spreading rapidly."
                      : "Continue monitoring the crop and seek expert confirmation if symptoms change."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="agro-future-grid">
          <div id="weather" className="agro-future-card">
            <CloudSun size={22} />
            <span className="agro-kicker">COMING NEXT</span>
            <h3>Weather & climate</h3>
            <p>Future-ready weather insights for better planting and crop decisions.</p>
          </div>
          <div id="ask" className="agro-future-card">
            <Sprout size={22} />
            <span className="agro-kicker">READY TO GROW</span>
            <h3>Ask AgroGuard</h3>
            <p>Keep your agricultural questions close as the assistant grows with your farm.</p>
          </div>
          <div id="farm" className="agro-future-card">
            <FileImage size={22} />
            <span className="agro-kicker">YOUR RECORD</span>
            <h3>My Farm</h3>
            <p>Farm details, crop history, and previous analysis will live here.</p>
          </div>
        </section>
        <footer className="agro-footer">
          <AgroGuardLogo compact />
          <span>
            Preliminary agricultural guidance · Always verify critical decisions with a local
            agronomist.
          </span>
        </footer>
      </main>
    </div>
  );
}
