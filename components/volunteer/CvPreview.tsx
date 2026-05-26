"use client";

import { memo } from "react";

interface CvPreviewProps {
  content: string;
}

function parseCvContent(content: string) {
  const sections: Record<string, string[]> = {};
  let currentSection = "";
  const lines = content.split("\n");
  
  for (const line of lines) {
    if (line.startsWith("─") || line.startsWith("═")) continue;
    if (line.trim() === "") continue;
    
    const upperLine = line.toUpperCase();
    if (
      upperLine.includes("FULL NAME") ||
      upperLine.includes("PROFESSIONAL SUMMARY") ||
      upperLine.includes("KEY METRICS") ||
      upperLine.includes("VOLUNTEER EXPERIENCE") ||
      upperLine.includes("SKILLS") ||
      upperLine.includes("CERTIFICATIONS") ||
      upperLine.includes("ACHIEVEMENTS") ||
      upperLine.includes("DOCUMENT METADATA")
    ) {
      currentSection = line.trim();
      sections[currentSection] = [];
    } else if (currentSection) {
      sections[currentSection].push(line);
    }
  }
  
  return sections;
}

export const CvPreview = memo(function CvPreview({ content }: CvPreviewProps) {
  const sections = parseCvContent(content);
  
  const fullName = sections["FULL NAME"]?.[0] || "";
  const email = sections["FULL NAME"]?.[1]?.replace("Email: ", "") || "";
  const summary = sections["PROFESSIONAL SUMMARY"] || [];
  const metrics = sections["KEY METRICS"] || [];
  const experience = sections["VOLUNTEER EXPERIENCE"] || [];
  const skills = sections["SKILLS"] || [];
  const certifications = sections["CERTIFICATIONS"] || [];
  const achievements = sections["ACHIEVEMENTS & DISTINCTIONS"] || [];
  
  return (
    <div className="bg-white text-gray-900 max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-200 mb-1">Qamqor AI</p>
            <h1 className="text-2xl font-bold">Social Capital Passport</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-200">Verified Admissions Portfolio</p>
          </div>
        </div>
      </div>
      
      {/* Name & Contact */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
        <p className="text-gray-600 mt-1">{email}</p>
      </div>
      
      {/* Summary */}
      {summary.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Professional Summary</h3>
          <div className="text-gray-700 leading-relaxed space-y-2">
            {summary.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map((line, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{line.replace("•", "").trim()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Experience */}
      {experience.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Volunteer Experience</h3>
          <div className="space-y-4">
            {experience.map((line, idx) => {
              if (line.match(/^\d+\./)) {
                return (
                  <div key={idx} className="pl-4 border-l-2 border-indigo-200">
                    <p className="font-semibold text-gray-900">{line}</p>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-gray-700 text-sm leading-relaxed pl-4">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Skills */}
      {skills.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((line, idx) => (
              <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                {line.replace("•", "").trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Certifications</h3>
          <div className="space-y-2">
            {certifications.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-1">•</span>
                <p className="text-gray-700 text-sm">{line.replace("•", "").trim()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Achievements & Distinctions</h3>
          <div className="space-y-3">
            {achievements.map((line, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{line.replace(/^\d+\.\s*/, "").trim()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="px-8 py-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Generated by Qamqor AI Admissions Suite • Verification: Organization-backed data from Social Capital Passport
        </p>
      </div>
    </div>
  );
});
