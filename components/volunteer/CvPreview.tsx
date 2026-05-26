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
  
  return (
    <div className="bg-white text-gray-900 max-w-3xl mx-auto shadow-lg border border-gray-200 relative">
      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[200px] font-bold text-gray-100 opacity-5">Q</span>
      </div>
      
      {/* Top branding - Website name + logo */}
      <div className="text-center pt-8 pb-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-700">Qamqor AI</h1>
        <p className="text-xs text-gray-500 mt-1">Social Capital Passport</p>
      </div>
      
      {/* Decorative line */}
      <div className="h-px bg-gray-200 mx-8" />
      
      {/* Big name centered */}
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-gray-900">{fullName}</h2>
        <p className="text-sm text-gray-500 mt-3">Verified Professional Profile</p>
      </div>
      
      {/* Skills (short bullets) */}
      {skills.length > 0 && (
        <div className="text-center py-4 px-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills</h3>
          <p className="text-sm text-gray-600">
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
        <div className="text-center py-4 px-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Experience</h3>
          <div className="space-y-2">
            {experience.slice(0, 3).map((exp, idx) => {
              const cleanExp = exp.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
              if (cleanExp && cleanExp.length < 80) {
                return (
                  <p key={idx} className="text-sm text-gray-600">
                    • {cleanExp}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
      
      {/* Footer section */}
      <div className="mt-8 px-8 pb-8 flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-500">Date: {today}</p>
          <div className="w-32 h-px bg-gray-300 mt-6" />
          <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 border border-gray-300 flex items-center justify-center bg-white mb-1">
            <span className="text-xs text-gray-400">QR</span>
          </div>
          <p className="text-xs text-gray-400">Scan to verify</p>
        </div>
      </div>
    </div>
  );
});
