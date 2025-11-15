"use client";

import { StructureAnalysis } from "@/lib/json-analyzer";
import { Database, Check, AlertCircle } from "lucide-react";

interface JsonAnalysisCardProps {
  analysis: StructureAnalysis;
  filename: string;
}

export default function JsonAnalysisCard({
  analysis,
  filename,
}: JsonAnalysisCardProps) {
  const isPostgres = analysis.recommendedStorage === "postgres";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-100 mb-1">
            {filename}
          </h3>
          <div className="flex items-center gap-2">
            <Database
              size={16}
              className={isPostgres ? "text-blue-400" : "text-green-400"}
            />
            <span
              className={`text-sm font-medium ${
                isPostgres ? "text-blue-400" : "text-green-400"
              }`}
            >
              {isPostgres ? "PostgreSQL" : "MongoDB"}
            </span>
            <span className="text-xs text-gray-500">
              {analysis.confidence.toFixed(0)}% confidence
            </span>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            analysis.confidence > 70
              ? "bg-green-900/30 text-green-400"
              : "bg-yellow-900/30 text-yellow-400"
          }`}
        >
          {analysis.confidence > 70 ? "High confidence" : "Moderate"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">Nesting Depth</div>
          <div className="text-sm font-semibold text-gray-200">
            {analysis.nestingDepth} levels
          </div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">Schema Consistency</div>
          <div className="text-sm font-semibold text-gray-200">
            {analysis.schemaConsistency.toFixed(0)}%
          </div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">Complexity</div>
          <div className="text-sm font-semibold text-gray-200">
            {analysis.objectCount} obj, {analysis.arrayCount} arr
          </div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <div className="text-xs text-gray-500 mb-1">Data Sparseity</div>
          <div className="text-sm font-semibold text-gray-200">
            {analysis.dataSparseity.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-xs font-semibold text-gray-400 mb-2">
          Characteristics:
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.isTabular && (
            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
              Tabular
            </span>
          )}
          {analysis.isFlat && (
            <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
              Flat
            </span>
          )}
          {analysis.isDeeplyNested && (
            <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
              Deeply Nested
            </span>
          )}
          {analysis.mixedTypes && (
            <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded">
              Mixed Types
            </span>
          )}
          {analysis.hasNestedArrays && (
            <span className="px-2 py-1 bg-pink-900/30 text-pink-400 text-xs rounded">
              Nested Arrays
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-3">
        <div className="text-xs font-semibold text-gray-400 mb-2">
          Why this database?
        </div>
        <ul className="space-y-1">
          {analysis.reasoning.slice(0, 3).map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-xs text-gray-300"
            >
              <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
