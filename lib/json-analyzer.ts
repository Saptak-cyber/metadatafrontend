/**
 * JSON Structure Analyzer
 * Analyzes JSON structure to determine if it's better suited for SQL or NoSQL storage
 */

export interface StructureAnalysis {
  // Core metrics
  nestingDepth: number;
  schemaConsistency: number; // 0-100, higher = more consistent
  fieldVariance: number; // 0-100, higher = more variance
  dataSparseity: number; // 0-100, higher = more sparse
  mixedTypes: boolean;

  // Data characteristics
  isTabular: boolean; // Array of objects with same fields
  isFlat: boolean; // Max depth <= 2
  isDeeplyNested: boolean; // Depth > 3
  hasArrays: boolean;
  hasNestedArrays: boolean;

  // Counts
  totalFields: number;
  uniqueFieldNames: number;
  arrayCount: number;
  objectCount: number;

  // Recommendation
  recommendedStorage: "postgres" | "mongodb";
  confidence: number; // 0-100
  reasoning: string[];
}

export function analyzeJsonStructure(data: any): StructureAnalysis {
  const analysis: StructureAnalysis = {
    nestingDepth: 0,
    schemaConsistency: 0,
    fieldVariance: 0,
    dataSparseity: 0,
    mixedTypes: false,
    isTabular: false,
    isFlat: false,
    isDeeplyNested: false,
    hasArrays: false,
    hasNestedArrays: false,
    totalFields: 0,
    uniqueFieldNames: 0,
    arrayCount: 0,
    objectCount: 0,
    recommendedStorage: "postgres",
    confidence: 0,
    reasoning: [],
  };

  // Calculate nesting depth
  analysis.nestingDepth = calculateDepth(data);
  analysis.isFlat = analysis.nestingDepth <= 2;
  analysis.isDeeplyNested = analysis.nestingDepth > 3;

  // Analyze structure type
  if (Array.isArray(data)) {
    analyzeArray(data, analysis);
  } else if (typeof data === "object" && data !== null) {
    analyzeObject(data, analysis);
  }

  // Determine recommendation
  determineRecommendation(analysis);

  return analysis;
}

function calculateDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== "object" || obj === null) {
    return currentDepth;
  }

  let maxDepth = currentDepth;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const depth = calculateDepth(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  } else {
    for (const key in obj) {
      const depth = calculateDepth(obj[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

function analyzeArray(arr: any[], analysis: StructureAnalysis) {
  analysis.hasArrays = true;
  analysis.arrayCount++;

  if (arr.length === 0) {
    analysis.isTabular = false;
    return;
  }

  // Check if it's an array of objects (tabular data)
  const allObjects = arr.every(
    (item) => typeof item === "object" && item !== null && !Array.isArray(item)
  );

  if (allObjects && arr.length > 0) {
    // Analyze schema consistency
    const schemas = arr.map((item) => Object.keys(item).sort().join(","));
    const uniqueSchemas = new Set(schemas);

    analysis.schemaConsistency =
      ((arr.length - uniqueSchemas.size + 1) / arr.length) * 100;
    analysis.isTabular = analysis.schemaConsistency > 80; // 80%+ same schema = tabular

    // Analyze field variance
    const allFields = new Set<string>();
    const fieldCounts = new Map<string, number>();

    arr.forEach((item) => {
      Object.keys(item).forEach((field) => {
        allFields.add(field);
        fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
      });
    });

    analysis.totalFields = Array.from(fieldCounts.values()).reduce(
      (a, b) => a + b,
      0
    );
    analysis.uniqueFieldNames = allFields.size;

    // Field variance: how many fields are not present in all objects
    const inconsistentFields = Array.from(fieldCounts.values()).filter(
      (count) => count < arr.length
    ).length;
    analysis.fieldVariance = (inconsistentFields / allFields.size) * 100;

    // Data sparseity: percentage of null/undefined values
    let nullCount = 0;
    let totalValues = 0;
    arr.forEach((item) => {
      Object.values(item).forEach((value) => {
        totalValues++;
        if (value === null || value === undefined) {
          nullCount++;
        }
      });
    });
    analysis.dataSparseity =
      totalValues > 0 ? (nullCount / totalValues) * 100 : 0;

    // Check for mixed types in same field
    const fieldTypes = new Map<string, Set<string>>();
    arr.forEach((item) => {
      Object.entries(item).forEach(([field, value]) => {
        if (!fieldTypes.has(field)) {
          fieldTypes.set(field, new Set());
        }
        fieldTypes
          .get(field)!
          .add(Array.isArray(value) ? "array" : typeof value);
      });
    });

    analysis.mixedTypes = Array.from(fieldTypes.values()).some(
      (types) => types.size > 1
    );

    // Check for nested arrays
    arr.forEach((item) => {
      if (hasNestedArrays(item)) {
        analysis.hasNestedArrays = true;
      }
    });
  }

  // Recursively analyze nested structures
  arr.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      analysis.objectCount++;
      countStructures(item, analysis);
    }
  });
}

function analyzeObject(obj: any, analysis: StructureAnalysis) {
  analysis.objectCount++;

  const keys = Object.keys(obj);
  analysis.uniqueFieldNames = keys.length;

  // Check for arrays within object
  let hasArrayValues = false;
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      hasArrayValues = true;
      analysis.hasArrays = true;
      analysis.arrayCount++;

      // Recursively analyze the array
      if (obj[key].length > 0) {
        analyzeArray(obj[key], analysis);
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      countStructures(obj[key], analysis);
    }
  }

  // Check if object is flat (no nested objects/arrays)
  const hasNestedStructures = Object.values(obj).some(
    (v) => typeof v === "object" && v !== null
  );

  if (!hasNestedStructures) {
    analysis.isFlat = true;
  }
}

function countStructures(obj: any, analysis: StructureAnalysis) {
  if (Array.isArray(obj)) {
    analysis.arrayCount++;
    obj.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        countStructures(item, analysis);
      }
    });
  } else if (typeof obj === "object" && obj !== null) {
    analysis.objectCount++;
    Object.values(obj).forEach((value) => {
      if (typeof value === "object" && value !== null) {
        countStructures(value, analysis);
      }
    });
  }
}

function hasNestedArrays(obj: any): boolean {
  if (Array.isArray(obj)) {
    return obj.some(
      (item) =>
        Array.isArray(item) ||
        (typeof item === "object" && item !== null && hasNestedArrays(item))
    );
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.values(obj).some((value) => hasNestedArrays(value));
  }

  return false;
}

function determineRecommendation(analysis: StructureAnalysis) {
  const reasons: string[] = [];
  
  // PRIMARY RULE: 90% Consistency Threshold with Multiple Checks
  // 1. If schema consistency >= 90% → PostgreSQL
  // 2. If schema consistency < 90% BUT data sparseity <= 15% AND field variance < 50% → PostgreSQL
  // 3. Otherwise → MongoDB
  
  if (analysis.schemaConsistency >= 90) {
    // High consistency - PostgreSQL
    analysis.recommendedStorage = "postgres";
    analysis.confidence = analysis.schemaConsistency;
    reasons.push(
      `✅ High schema consistency (${analysis.schemaConsistency.toFixed(1)}%) - PostgreSQL selected`
    );
    reasons.push(
      `Consistent structure with ${analysis.totalFields} fields is ideal for relational database`
    );
    
    // Additional context reasons
    if (analysis.isFlat) {
      reasons.push(`Flat structure (${analysis.nestingDepth} levels) enhances PostgreSQL efficiency`);
    }
    if (analysis.isTabular) {
      reasons.push(`Tabular data format is perfect for SQL queries`);
    }
    if (analysis.fieldVariance < 20) {
      reasons.push(`Low field variance (${analysis.fieldVariance.toFixed(1)}%) supports strong schema`);
    }
  } else if (analysis.dataSparseity <= 15 && analysis.fieldVariance < 50) {
    // Low consistency BUT very few missing values AND moderate field variance - PostgreSQL
    // This handles cases where objects have a few optional fields but are mostly consistent
    analysis.recommendedStorage = "postgres";
    analysis.confidence = Math.min(100 - analysis.dataSparseity, 100 - analysis.fieldVariance / 2);
    reasons.push(
      `✅ Very few missing values (${analysis.dataSparseity.toFixed(1)}% sparseity) and moderate field variance (${analysis.fieldVariance.toFixed(1)}%) - PostgreSQL selected`
    );
    reasons.push(
      `Clean tabular data with optional fields is manageable in relational database (schema consistency: ${analysis.schemaConsistency.toFixed(1)}%)`
    );
    
    // Additional context reasons
    if (analysis.isTabular) {
      reasons.push(`Tabular data format is perfect for SQL queries`);
    }
    if (analysis.isFlat) {
      reasons.push(`Flat structure (${analysis.nestingDepth} levels) suits PostgreSQL`);
    }
    reasons.push(`PostgreSQL can handle optional fields efficiently with nullable columns`);
  } else {
    // High inconsistency - MongoDB
    analysis.recommendedStorage = "mongodb";
    analysis.confidence = 100 - analysis.schemaConsistency;
    reasons.push(
      `❌ High inconsistency detected (schema: ${analysis.schemaConsistency.toFixed(1)}%, field variance: ${analysis.fieldVariance.toFixed(1)}%) - MongoDB selected`
    );
    reasons.push(
      `Flexible/inconsistent schema requires MongoDB's document model`
    );
    
    // Additional context reasons
    if (analysis.fieldVariance > 70) {
      reasons.push(`Extremely high field variance (${analysis.fieldVariance.toFixed(1)}%) - Objects have very different structures`);
    } else if (analysis.fieldVariance > 40) {
      reasons.push(`High field variance (${analysis.fieldVariance.toFixed(1)}%) benefits from flexible schema`);
    }
    
    if (analysis.schemaConsistency < 30) {
      reasons.push(`Very low schema consistency (${analysis.schemaConsistency.toFixed(1)}%) - Objects share few common fields`);
    }
    
    if (analysis.isDeeplyNested) {
      reasons.push(`Deep nesting (${analysis.nestingDepth} levels) suits document database`);
    }
    if (analysis.hasNestedArrays) {
      reasons.push(`Nested arrays are naturally handled by MongoDB`);
    }
    if (analysis.dataSparseity > 30) {
      reasons.push(`Sparse data (${analysis.dataSparseity.toFixed(1)}% null values) saves space in MongoDB`);
    }
    if (analysis.mixedTypes) {
      reasons.push(`Mixed field types leverage MongoDB's schema-less nature`);
    }
  }

  analysis.reasoning = reasons;
}

/**
 * Get a human-readable summary of the analysis
 */
export function getAnalysisSummary(analysis: StructureAnalysis): string {
  const lines = [
    `📊 JSON Structure Analysis`,
    ``,
    `Structure Metrics:`,
    `  • Nesting depth: ${analysis.nestingDepth} level(s)`,
    `  • Schema consistency: ${analysis.schemaConsistency.toFixed(1)}%`,
    `  • Field variance: ${analysis.fieldVariance.toFixed(1)}%`,
    `  • Data sparseity: ${analysis.dataSparseity.toFixed(1)}%`,
    `  • Complexity: ${analysis.objectCount} objects, ${analysis.arrayCount} arrays`,
    ``,
    `Characteristics:`,
    `  • Tabular: ${analysis.isTabular ? "Yes" : "No"}`,
    `  • Flat structure: ${analysis.isFlat ? "Yes" : "No"}`,
    `  • Deeply nested: ${analysis.isDeeplyNested ? "Yes" : "No"}`,
    `  • Mixed types: ${analysis.mixedTypes ? "Yes" : "No"}`,
    `  • Nested arrays: ${analysis.hasNestedArrays ? "Yes" : "No"}`,
    ``,
    `📍 Recommendation: ${analysis.recommendedStorage.toUpperCase()}`,
    `   Confidence: ${analysis.confidence.toFixed(1)}%`,
    ``,
    `Reasoning:`,
    ...analysis.reasoning.map((r) => `  • ${r}`),
  ];

  return lines.join("\n");
}
