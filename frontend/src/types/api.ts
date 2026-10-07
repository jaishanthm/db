export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface MalwareSummary {
  id: number;
  slug: string;
  name: string;
  aliases: string[];
  primary_type: string;
  severity: Severity;
  first_seen: string;
  last_seen: string;
  status: string;
  architecture: string;
  platforms: string[];
  target_industries: string[];
  confidence: string;
  description?: string;
}

export interface CapabilityItem {
  id: number;
  name: string;
  category: string;
  supported: boolean;
  details?: string;
}

export interface VariantItem {
  id: number;
  variant_name: string;
  version: string;
  release_date?: string;
  differences?: string;
  c2_protocol: string;
}

export interface TechniqueLink {
  technique_id: string;
  technique_name: string;
  tactic_name: string;
  use_case: string;
  confidence: string;
  url: string;
}

export interface ActorLink {
  actor_id: number;
  actor_slug: string;
  actor_name: string;
  role: string;
  origin_country: string;
}

export interface CampaignLink {
  campaign_id: number;
  campaign_slug: string;
  campaign_name: string;
  start_date: string;
  deployment_role: string;
}

export interface IndicatorItem {
  id: number;
  indicator_type: string;
  value: string;
  confidence: string;
  severity: string;
  status: string;
  first_seen?: string;
  last_seen?: string;
  source?: string;
  malware_name?: string;
  malware_slug?: string;
}

export interface VulnerabilityLink {
  cve_id: string;
  title: string;
  cvss_score: number;
  severity: string;
  exploitation_stage: string;
}

export interface TimelineEventItem {
  id: number;
  event_date: string;
  event_year: number;
  title: string;
  description: string;
  event_type: string;
  significance: string;
}

export interface DefensiveRuleItem {
  id: number;
  rule_type: string;
  name: string;
  description?: string;
  rule_content: string;
  target_component: string;
  severity: string;
}

export interface CaseStudyBrief {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  incident_date: string;
  target_entity: string;
  industry: string;
}

export interface MalwareDetail {
  id: number;
  slug: string;
  name: string;
  aliases: string[];
  primary_type: string;
  severity: Severity;
  first_seen: string;
  last_seen: string;
  status: string;
  architecture: string;
  description: string;
  technical_analysis: string;
  confidence: string;
  source: string;
  source_url: string;
  platforms: string[];
  target_industries: string[];
  capabilities: CapabilityItem[];
  variants: VariantItem[];
  techniques: TechniqueLink[];
  actors: ActorLink[];
  campaigns: CampaignLink[];
  indicators: IndicatorItem[];
  vulnerabilities: VulnerabilityLink[];
  timeline_events: TimelineEventItem[];
  defensive_rules: DefensiveRuleItem[];
  case_studies: CaseStudyBrief[];
}

export interface ThreatActorSummary {
  id: number;
  slug: string;
  name: string;
  aliases: string[];
  origin_country: string;
  motivation: string;
  first_seen: string;
  status: string;
  sophistication: string;
  target_sectors: string[];
  target_countries: string[];
  malware_count: number;
  campaign_count: number;
}

export interface ThreatActorDetail {
  id: number;
  slug: string;
  name: string;
  aliases: string[];
  origin_country: string;
  motivation: string;
  first_seen: string;
  status: string;
  sophistication: string;
  description: string;
  source: string;
  target_sectors: string[];
  target_countries: string[];
  malware: Array<{
    malware_id: number;
    malware_slug: string;
    malware_name: string;
    primary_type: string;
    role: string;
  }>;
  campaigns: Array<{
    campaign_id: number;
    campaign_slug: string;
    campaign_name: string;
    start_date: string;
    attribution_confidence: string;
  }>;
}

export interface CampaignSummary {
  id: number;
  slug: string;
  name: string;
  start_date: string;
  end_date?: string;
  status: string;
  objective: string;
  target_industries: string[];
  target_regions: string[];
  confidence: string;
  malware_count: number;
  actor_count: number;
}

export interface CampaignDetail {
  id: number;
  slug: string;
  name: string;
  start_date: string;
  end_date?: string;
  status: string;
  objective: string;
  description: string;
  impact_summary: string;
  target_industries: string[];
  target_regions: string[];
  confidence: string;
  source: string;
  malware: Array<{
    malware_id: number;
    malware_slug: string;
    malware_name: string;
    primary_type: string;
    deployment_role: string;
  }>;
  actors: Array<{
    actor_id: number;
    actor_slug: string;
    actor_name: string;
    attribution_confidence: string;
  }>;
}

export interface MitreTechniqueItem {
  id: string;
  name: string;
  tactic_id: string;
  tactic_name: string;
  description: string;
  url: string;
  malware_count: number;
}

export interface MitreTacticItem {
  id: string;
  name: string;
  description: string;
  order_index: number;
  techniques: MitreTechniqueItem[];
}

export interface CaseStudyDetail {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  malware_id?: number;
  malware_name?: string;
  malware_slug?: string;
  campaign_id?: number;
  campaign_name?: string;
  incident_date: string;
  target_entity: string;
  industry: string;
  region: string;
  executive_summary: string;
  threat_context: string;
  initial_access: string;
  execution_flow: string;
  persistence_mechanism: string;
  privilege_escalation: string;
  defense_evasion: string;
  lateral_movement: string;
  command_and_control: string;
  exfiltration_impact: string;
  detection_opportunities: string;
  containment_actions: string;
  lessons_learned: string;
  mitre_attack: Array<{ id: string; name: string; tactic: string }>;
  iocs: Array<{ type: string; value: string; desc?: string }>;
  references: string[];
}

export interface AnalyticsData {
  metrics: {
    total_malware: number;
    total_threat_actors: number;
    total_campaigns: number;
    total_indicators: number;
    total_case_studies: number;
    total_defensive_rules: number;
  };
  malware_by_type: Array<{ type: string; count: number }>;
  severity_distribution: Array<{ severity: string; count: number }>;
  malware_by_year: Array<{ year: string; count: number }>;
  platforms_distribution: Array<{ platform: string; count: number }>;
  top_techniques: Array<{ id: string; name: string; tactic: string; malware_count: number }>;
  top_industries: Array<{ industry: string; count: number }>;
  actor_motivations: Array<{ motivation: string; count: number }>;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    group: string;
    subtype: string;
    extra?: Record<string, any>;
  }>;
  links: Array<{
    source: string;
    target: string;
    label: string;
  }>;
  total_nodes: number;
  total_links: number;
}

export interface SchemaTable {
  name: string;
  column_count: number;
  columns: Array<{
    name: string;
    type: string;
    primary_key: boolean;
    nullable: boolean;
    foreign_key?: string;
  }>;
}

export interface SqlResult {
  status: 'success' | 'error';
  error?: string;
  columns: string[];
  rows: any[][];
  row_count: number;
  execution_time_ms: number;
  query: string;
}

export interface ResearchDossier {
  status: string;
  malware: MalwareSummary & {
    technical_analysis?: string;
    source?: string;
    confidence?: string;
  };
  knowledge_graph: {
    actors: Array<{
      id: number;
      slug: string;
      name: string;
      origin_country: string;
      motivation: string;
      role: string;
      primary_targets: string[];
    }>;
    campaigns: Array<{
      id: number;
      slug: string;
      name: string;
      start_date: string;
      status: string;
      role: string;
      description: string;
    }>;
    variants: Array<{
      id: number;
      name: string;
      version: string;
      c2_protocol: string;
      differences?: string;
    }>;
    techniques: Array<{
      id: string;
      name: string;
      tactic: string;
      use_case: string;
      confidence: string;
      url: string;
    }>;
    iocs: Array<{
      id: number;
      type: string;
      value: string;
      confidence: string;
      severity: string;
      status: string;
    }>;
    vulnerabilities: Array<{
      cve_id: string;
      title: string;
      cvss_score: number;
      severity: string;
      exploitation_stage: string;
    }>;
    case_studies: Array<{
      id: number;
      slug: string;
      title: string;
      incident_date: string;
      industry: string;
      target: string;
      summary: string;
    }>;
    detection_rules: Array<{
      id: number;
      name: string;
      rule_type: string;
      severity: string;
      target: string;
      rule_content: string;
    }>;
    mitigations: Array<{
      phase: string;
      title: string;
      objective: string;
      technical_controls: string;
      cisa_guideline: string;
    }>;
  };
  meta: {
    assembled_at: string;
    intelligence_tier_count: number;
    research_ready: boolean;
  };
}

export interface TaxonomyNode {
  id: string;
  name: string;
  description: string;
  count: number;
  db_types: string[];
  children: TaxonomyNode[];
}

export interface GlossaryTermItem {
  id: number;
  term: string;
  category: string;
  definition: string;
  technical_example?: string;
  example?: string;
  related_mitre?: string;
  references?: string[];
}

export interface MitigationGuidelineItem {
  id: number;
  slug: string;
  phase: string;
  title: string;
  objective: string;
  technical_controls: string;
  target_environment: string;
  cisa_guideline?: string;
  framework?: string;
}

export interface AnalysisConceptItem {
  id: number;
  slug: string;
  category: string;
  title: string;
  technical_overview: string;
  forensic_indicators: string;
  investigation_tooling: string;
}

export interface TelemetrySourceItem {
  id: number;
  source_type: string;
  event_id?: string;
  name: string;
  description: string;
  detection_value: string;
  sample_log?: string;
}
