"use client";

import { memo } from "react";

interface CvPreviewProps {
  content: string;
}

function parseCvContent(content: string) {
  const sections: { fullName: string; email: string; summary: string[]; experience: string[]; skills: string[]; certifications: string[] } = {
    fullName: "",
    email: "",
    summary: [],
    experience: [],
    skills: [],
    certifications: []
  };
  const lines = content.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("─") || trimmed.startsWith("═")) continue;

    const upper = trimmed.toUpperCase();
    if (upper.includes("FULL NAME")) {
      currentSection = "fullName";
    } else if (upper.includes("PROFESSIONAL SUMMARY")) {
      currentSection = "summary";
    } else if (upper.includes("VOLUNTEER EXPERIENCE")) {
      currentSection = "experience";
    } else if (upper.includes("SKILLS")) {
      currentSection = "skills";
    } else if (upper.includes("CERTIFICATIONS")) {
      currentSection = "certifications";
    } else if (currentSection === "fullName" && !sections.fullName) {
      sections.fullName = trimmed;
    } else if (currentSection === "fullName" && trimmed.toLowerCase().startsWith("email:")) {
      sections.email = trimmed.replace(/email:\s*/i, "");
    } else if (currentSection === "summary") {
      sections.summary.push(trimmed);
    } else if (currentSection === "experience") {
      sections.experience.push(trimmed);
    } else if (currentSection === "skills") {
      sections.skills.push(trimmed);
    } else if (currentSection === "certifications") {
      sections.certifications.push(trimmed);
    }
  }

  return sections;
}

export const CvPreview = memo(function CvPreview({ content }: CvPreviewProps) {
  const sections = parseCvContent(content);
  
  const fullName = sections.fullName || "";
  const experience = sections.experience || [];
  const skills = sections.skills || [];
  
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const certId = "QCP-" + Date.now().toString().slice(-8);
  
  return (
    <div className="bg-white text-gray-900 w-[297mm] h-[210mm] shadow-lg relative border-4 border-amber-500 flex flex-col mx-auto p-[60px]">
      {/* Inner border */}
      <div className="absolute inset-1 border border-amber-500/50 pointer-events-none" />

      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[200px] font-serif font-bold text-amber-500 opacity-5">Q</span>
      </div>

      {/* Header */}
      <div className="text-center pb-8">
        <h1 className="text-xl font-serif font-bold text-gray-700 tracking-wide">CERTIFICATE OF VERIFICATION</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center text-center max-w-3xl">
        {/* Big name centered */}
        <div className="pb-4">
          <h2 className="text-5xl font-serif font-bold text-gray-900">{fullName}</h2>
        </div>

        {/* Subtitle */}
        <div className="pb-6">
          <p className="text-sm text-gray-600 font-serif leading-relaxed">
            This certifies that the above-named individual has demonstrated verified
          </p>
          <p className="text-sm text-gray-600 font-serif leading-relaxed">
            professional competency through the Qamqor Social Capital Passport.
          </p>
        </div>

        {/* Skills (short bullets) */}
        {skills.length > 0 && (
          <div className="pb-6">
            <h3 className="text-sm font-serif font-semibold text-gray-700 mb-2">Verified Skills</h3>
            <p className="text-sm text-gray-600 font-serif">
              {skills
                .map(s => s.replace(/•/g, "").trim())
                .filter(s => s)
                .slice(0, 6)
                .join(" • ")}
            </p>
          </div>
        )}

        {/* Experience (short bullets) */}
        {experience.length > 0 && (
          <div className="pb-6">
            <h3 className="text-sm font-serif font-semibold text-gray-700 mb-2">Key Experience</h3>
            <div className="space-y-1">
              {experience.slice(0, 3).map((exp, idx) => {
                const cleanExp = exp.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
                if (cleanExp && cleanExp.length < 80) {
                  return (
                    <p key={idx} className="text-sm text-gray-600 font-serif">
                      • {cleanExp}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-8">
        <div>
          <p className="text-xs text-gray-500 font-serif">Certificate ID: {certId}</p>
          <p className="text-xs text-gray-500 font-serif mt-1">Date: {today}</p>
          <div className="w-40 h-px bg-amber-500 mt-4" />
          <p className="text-xs text-gray-600 font-serif mt-1">Authorized Signature</p>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 border border-amber-500 flex items-center justify-center bg-white mb-1">
            <span className="text-xs text-gray-400">QR</span>
          </div>
          <p className="text-xs text-gray-400 font-serif">Scan to verify</p>
        </div>
      </div>
    </div>
  );
});
