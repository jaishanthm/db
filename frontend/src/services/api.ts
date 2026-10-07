import {
  MalwareSummary, MalwareDetail, ThreatActorSummary, ThreatActorDetail,
  CampaignSummary, CampaignDetail, MitreTacticItem, MitreTechniqueItem,
  IndicatorItem, CaseStudyDetail, AnalyticsData, GraphData,
  SchemaTable, SqlResult,
  ResearchDossier, TaxonomyNode, GlossaryTermItem, MitigationGuidelineItem,
  AnalysisConceptItem, TelemetrySourceItem
} from '../types/api';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    let msg = `Request failed (${res.status})`;
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.detail || parsed.error || msg;
    } catch {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // System Health
  async getHealth() {
    return fetchJson<{ status: string; database: string; version: string }>('/health');
  },

  // Malware
  async listMalware(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return fetchJson<{
      status: string;
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      data: MalwareSummary[];
    }>(`${API_BASE}/malware?${query.toString()}`);
  },

  async getMalwareDetail(ident: string) {
    return fetchJson<{ status: string; data: MalwareDetail }>(`${API_BASE}/malware/${ident}`);
  },

  async compareMalware(familyA: string, familyB: string) {
    return fetchJson<{
      status: string;
      family_a: any;
      family_b: any;
      overlap: {
        capabilities: string[];
        techniques: string[];
        platforms: string[];
      };
    }>(`${API_BASE}/malware/compare?family_a=${encodeURIComponent(familyA)}&family_b=${encodeURIComponent(familyB)}`);
  },

  // Threat Actors
  async listActors(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      data: ThreatActorSummary[];
    }>(`${API_BASE}/actors?${query.toString()}`);
  },

  async getActorDetail(ident: string) {
    return fetchJson<{ status: string; data: ThreatActorDetail }>(`${API_BASE}/actors/${ident}`);
  },

  // Campaigns
  async listCampaigns(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      data: CampaignSummary[];
    }>(`${API_BASE}/campaigns?${query.toString()}`);
  },

  async getCampaignDetail(ident: string) {
    return fetchJson<{ status: string; data: CampaignDetail }>(`${API_BASE}/campaigns/${ident}`);
  },

  // ATT&CK
  async getAttackMatrix() {
    return fetchJson<{ status: string; tactics: MitreTacticItem[] }>(`${API_BASE}/techniques/matrix`);
  },

  async getTechniqueDetail(techId: string) {
    return fetchJson<{
      status: string;
      data: {
        id: string;
        name: string;
        tactic_id: string;
        tactic_name: string;
        description: string;
        url: string;
        malware: Array<{
          id: number;
          slug: string;
          name: string;
          primary_type: string;
          severity: string;
          use_case: string;
          confidence: string;
        }>;
      };
    }>(`${API_BASE}/techniques/${techId}`);
  },

  // Indicators
  async listIndicators(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      page: number;
      per_page: number;
      data: IndicatorItem[];
    }>(`${API_BASE}/indicators?${query.toString()}`);
  },

  async lookupIoc(value: string) {
    return fetchJson<{
      status: string;
      query: string;
      total_matches: number;
      results: IndicatorItem[];
    }>(`${API_BASE}/indicators/lookup?value=${encodeURIComponent(value)}`);
  },

  // Case Studies
  async listCaseStudies(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      data: any[];
    }>(`${API_BASE}/case-studies?${query.toString()}`);
  },

  async getCaseStudyDetail(slug: string) {
    return fetchJson<{ status: string; data: CaseStudyDetail }>(`${API_BASE}/case-studies/${slug}`);
  },

  // Analytics
  async getAnalytics() {
    return fetchJson<AnalyticsData>(`${API_BASE}/analytics`);
  },

  // Global Search
  async search(query: string) {
    return fetchJson<{
      status: string;
      query: string;
      total_matches: number;
      results: {
        malware: Array<{ id: number; slug: string; title: string; subtitle: string; type: string }>;
        actors: Array<{ id: number; slug: string; title: string; subtitle: string; type: string }>;
        campaigns: Array<{ id: number; slug: string; title: string; subtitle: string; type: string }>;
        techniques: Array<{ id: string; slug: string; title: string; subtitle: string; type: string }>;
        indicators: Array<{ id: number; slug: string; title: string; subtitle: string; type: string }>;
        case_studies: Array<{ id: number; slug: string; title: string; subtitle: string; type: string }>;
      };
    }>(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  },

  // Graph
  async getGraph(focusMalware?: string) {
    const url = focusMalware ? `${API_BASE}/graph?focus_malware=${encodeURIComponent(focusMalware)}` : `${API_BASE}/graph`;
    return fetchJson<GraphData>(url);
  },

  // Schema
  async getSchema() {
    return fetchJson<{
      status: string;
      total_tables: number;
      total_relationships: number;
      tables: SchemaTable[];
      relationships: any[];
    }>(`${API_BASE}/schema`);
  },

  // SQL Explorer
  async getSampleQueries() {
    return fetchJson<{
      status: string;
      samples: Array<{ title: string; description: string; sql: string }>;
    }>(`${API_BASE}/sql/samples`);
  },

  async executeSql(query: string) {
    return fetchJson<SqlResult>(`${API_BASE}/sql/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
  },

  // Quality Report
  async getQualityReport() {
    return fetchJson<any>(`${API_BASE}/quality-report`);
  },

  // Research Mode
  async getResearchDossier(slug: string) {
    return fetchJson<ResearchDossier>(`${API_BASE}/research/${encodeURIComponent(slug)}`);
  },

  // Taxonomy
  async getTaxonomy() {
    return fetchJson<{
      status: string;
      total_catalog: number;
      taxonomy: TaxonomyNode[];
    }>(`${API_BASE}/taxonomy`);
  },

  // Knowledge Base: Glossary
  async getGlossary(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      terms: GlossaryTermItem[];
    }>(`${API_BASE}/knowledge/glossary?${query.toString()}`);
  },

  // Knowledge Base: Mitigations
  async getMitigations(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      guidelines: MitigationGuidelineItem[];
    }>(`${API_BASE}/knowledge/mitigations?${query.toString()}`);
  },

  // Knowledge Base: Malware Analysis Concepts
  async getAnalysisConcepts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      concepts: AnalysisConceptItem[];
    }>(`${API_BASE}/knowledge/analysis-concepts?${query.toString()}`);
  },

  // Knowledge Base: Telemetry Hub
  async getTelemetryHub(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return fetchJson<{
      status: string;
      total: number;
      sources: TelemetrySourceItem[];
    }>(`${API_BASE}/knowledge/telemetry-hub?${query.toString()}`);
  }
};
