import posthog from "posthog-js";

export const track = {
  pageChanged: (page: string, persona: string) =>
    posthog.capture("page_changed", { page, persona }),

  personaSwitched: (from: string, to: string) =>
    posthog.capture("persona_switched", { from, to }),

  incidentDetailViewed: (incidentId: number, severity: string, application: string) =>
    posthog.capture("incident_detail_viewed", { incident_id: incidentId, severity, application }),

  incidentAckStarted: (incidentId: number, severity: string) =>
    posthog.capture("incident_ack_started", { incident_id: incidentId, severity }),

  incidentAssignStarted: (incidentId: number, severity: string) =>
    posthog.capture("incident_assign_started", { incident_id: incidentId, severity }),

  viewModeChanged: (mode: "grid" | "table") =>
    posthog.capture("view_mode_changed", { mode }),

  filterSeverityChanged: (severities: string[]) =>
    posthog.capture("filter_severity_changed", { severities, count: severities.length }),

  filterAppChanged: (apps: string[]) =>
    posthog.capture("filter_app_changed", { apps, count: apps.length }),

  filterLocationChanged: (locations: string[]) =>
    posthog.capture("filter_location_changed", { locations, count: locations.length }),

  filtersCleared: () =>
    posthog.capture("filters_cleared"),

  bulkAckStarted: (count: number) =>
    posthog.capture("bulk_ack_started", { incident_count: count }),

  bulkAssignStarted: (count: number) =>
    posthog.capture("bulk_assign_started", { incident_count: count }),

  globalFilterApplied: (project: string | null, pipeline: string | null, cameraGroupCount: number) =>
    posthog.capture("global_filter_applied", { project, pipeline, camera_group_count: cameraGroupCount }),

  themeToggled: (to: "dark" | "light") =>
    posthog.capture("theme_toggled", { theme: to }),

  platformSwitched: (to: string) =>
    posthog.capture("platform_switched", { platform: to }),

  gridExpanded: () =>
    posthog.capture("incident_grid_expanded"),
};
