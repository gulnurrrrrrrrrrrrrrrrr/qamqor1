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
  const email = sections.email || "";
  const summary = sections.summary || [];
  const experience = sections.experience || [];
  const skills = sections.skills || [];
  const certifications = sections.certifications || [];
  
  const summaryText = summary.join(" ").substring(0, 200);
  
  return (
    <div className="bg-white text-gray-900 max-w-3xl mx-auto shadow-lg border border-gray-200">
      {/* Title - Centered */}
      <div className="text-center py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Certificate of Professional Profile</h1>
      </div>
      
      {/* Name + Email - Centered */}
      <div className="text-center py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
        <p className="text-gray-600 mt-2">{email}</p>
      </div>
      
      {/* Summary (2-3 lines max) */}
      {summary.length > 0 && (
        <div className="px-8 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{summaryText}...</p>
        </div>
      )}
      
      {/* Experience (bullets only) */}
      {experience.length > 0 && (
        <div className="px-8 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Experience</h3>
          <ul className="space-y-1">
            {experience.slice(0, 4).map((exp, idx) => {
              const cleanExp = exp.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
              if (cleanExp && cleanExp.length < 100) {
                return (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{cleanExp}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
      
      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Skills</h3>
          <div className="text-sm text-gray-700">
            {skills
              .map(s => s.replace(/•/g, "").trim())
              .filter(s => s)
              .slice(0, 8)
              .join(" • ")}
          </div>
        </div>
      )}
      
      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="px-8 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Certifications</h3>
          <ul className="space-y-1">
            {certifications.slice(0, 4).map((cert, idx) => {
              const cleanCert = cert.replace(/•/g, "").trim();
              if (cleanCert && cleanCert.length < 80) {
                return (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{cleanCert}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
      
      {/* Footer with QR placeholder */}
      <div className="px-8 py-4 bg-gray-50 flex justify-between items-center">
        <p className="text-xs text-gray-500">Generated by Qamqor AI</p>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 border border-gray-300 flex items-center justify-center bg-white">
            <span className="text-xs text-gray-400">QR</span>
          </div>
          <span className="text-xs text-gray-500">Scan to verify</span>
        </div>
      </div>
    </div>
  );
});
