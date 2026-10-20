import fs from 'fs';
import path from 'path';
import * as si from 'simple-icons';
import { Resvg } from '@resvg/resvg-js';

// SVG canvas dimensions
const W = 1680;
const H = 1060;

// Escape XML helper
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Extract icon paths and hex from simple-icons
const icons = {
  react: { path: si.siReact.path, hex: '#' + si.siReact.hex, title: 'React' },
  tailwind: { path: si.siTailwindcss.path, hex: '#' + si.siTailwindcss.hex, title: 'Tailwind CSS' },
  nodejs: { path: si.siNodedotjs.path, hex: '#' + si.siNodedotjs.hex, title: 'Node.js' },
  express: { path: si.siExpress.path, hex: '#FFFFFF', title: 'Express' },
  mongodb: { path: si.siMongodb.path, hex: '#' + si.siMongodb.hex, title: 'MongoDB' },
  docker: { path: si.siDocker.path, hex: '#' + si.siDocker.hex, title: 'Docker' },
  kubernetes: { path: si.siKubernetes.path, hex: '#' + si.siKubernetes.hex, title: 'Kubernetes' },
  argocd: { path: si.siArgo.path, hex: '#' + si.siArgo.hex, title: 'Argo CD' },
  github: { path: si.siGithub.path, hex: '#FFFFFF', title: 'GitHub' },
  githubactions: { path: si.siGithubactions.path, hex: '#' + si.siGithubactions.hex, title: 'GitHub Actions' },
  trivy: { path: si.siTrivy.path, hex: '#4B68FF', title: 'Trivy' },
  prometheus: { path: si.siPrometheus.path, hex: '#' + si.siPrometheus.hex, title: 'Prometheus' },
  grafana: { path: si.siGrafana.path, hex: '#' + si.siGrafana.hex, title: 'Grafana' },
  gemini: { path: si.siGooglegemini.path, hex: '#' + si.siGooglegemini.hex, title: 'Google Gemini' },
  gmail: { path: si.siGmail.path, hex: '#' + si.siGmail.hex, title: 'Gmail' },
  nginx: { path: si.siNginx.path, hex: '#' + si.siNginx.hex, title: 'NGINX' }
};

// Clean vector paths for custom icons (viewBox 0 0 24 24)
const customIcons = {
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  developer: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z',
  terminal: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.58-2.59L7.5 9l4 4-4 4z',
  clock: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z'
};

const renderIcon = (iconKey, x, y, size = 32, overrideColor = null) => {
  const icon = icons[iconKey];
  const color = overrideColor || (icon ? icon.hex : '#94a3b8');
  const pathData = icon ? icon.path : customIcons[iconKey] || '';
  return `
    <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24">
      <path fill="${color}" d="${pathData}"/>
    </svg>
  `;
};

const renderCustomIcon = (iconKey, x, y, size = 32, color = '#60a5fa') => {
  const pathData = customIcons[iconKey] || '';
  return `
    <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24">
      <path fill="${color}" d="${pathData}"/>
    </svg>
  `;
};

// Render Node Card with proper styling & responsive text
const renderCard = ({
  x, y, w, h,
  title, subtitle,
  iconKeys = [],
  customIconKey = null,
  badge = null,
  borderColor = '#23233a',
  glowColor = 'rgba(59, 130, 246, 0.15)',
  bg = '#12121f'
}) => {
  const iconCount = iconKeys.length + (customIconKey ? 1 : 0);
  const iconSize = 36;
  const startX = x + (w - (iconCount * (iconSize + 8) - 8)) / 2;
  const iconY = y + 14;

  let iconsMarkup = '';
  let curX = startX;

  iconKeys.forEach(k => {
    iconsMarkup += renderIcon(k, curX, iconY, iconSize);
    curX += iconSize + 8;
  });

  if (customIconKey) {
    iconsMarkup += renderCustomIcon(customIconKey, curX, iconY, iconSize);
  }

  const badgeMarkup = badge ? `
    <rect x="${x + w - 82}" y="${y + 8}" width="74" height="18" rx="9" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="${x + w - 45}" y="${y + 20}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#38bdf8" text-anchor="middle">${badge}</text>
  ` : '';

  return `
    <g class="node-card">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${bg}" stroke="${borderColor}" stroke-width="1.5" filter="drop-shadow(0 4px 12px ${glowColor})"/>
      ${badgeMarkup}
      ${iconsMarkup}
      <text x="${x + w / 2}" y="${iconY + iconSize + 18}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="middle">${title}</text>
      ${subtitle ? `<text x="${x + w / 2}" y="${iconY + iconSize + 34}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="500" fill="#94a3b8" text-anchor="middle">${subtitle}</text>` : ''}
    </g>
  `;
};

// Render Step Badge in green circle
const renderStepBadge = (num, cx, cy) => {
  return `
    <g class="step-badge">
      <circle cx="${cx}" cy="${cy}" r="14" fill="#10b981" stroke="#064e3b" stroke-width="2" filter="drop-shadow(0 2px 5px rgba(16, 185, 129, 0.4))"/>
      <text x="${cx}" y="${cy + 5}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">${num}</text>
    </g>
  `;
};

// Render Connector Line with flowing dash animation, arrowhead and text label
const renderConnector = ({
  id, d,
  label = '',
  labelX = 0, labelY = 0,
  isObs = false
}) => {
  const lineClass = isObs ? 'flow-line-obs' : 'flow-line';
  const marker = isObs ? 'url(#arrow-amber)' : 'url(#arrow-blue)';
  const strokeColor = isObs ? 'url(#grad-obs)' : 'url(#grad-blue)';

  const labelWidth = label.length * 6.5 + 20;
  const labelMarkup = label ? `
    <rect x="${labelX - labelWidth / 2}" y="${labelY - 10}" width="${labelWidth}" height="19" rx="5" fill="#090d16" stroke="${isObs ? '#d97706' : '#4338ca'}" stroke-width="1" opacity="0.95"/>
    <text x="${labelX}" y="${labelY + 3.5}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="${isObs ? '#fde68a' : '#c7d2fe'}" text-anchor="middle">${label}</text>
  ` : '';

  return `
    <g id="${id}">
      <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="2.5" marker-end="${marker}" class="${lineClass}"/>
      ${labelMarkup}
    </g>
  `;
};

// Build the full SVG string
const generateSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bg-glow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#121324"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </radialGradient>

    <!-- Flow Line Gradients -->
    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>

    <linearGradient id="grad-obs" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>

    <!-- Arrow Markers -->
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7"/>
    </marker>

    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316"/>
    </marker>

    <!-- Soft Glow Filter -->
    <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <style>
      @keyframes dashflow {
        to {
          stroke-dashoffset: -28;
        }
      }
      .flow-line {
        stroke-dasharray: 7 7;
        animation: dashflow 1.5s linear infinite;
      }
      .flow-line-obs {
        stroke-dasharray: 7 7;
        animation: dashflow 1.5s linear infinite;
      }
      .zone-border {
        stroke-dasharray: 4 4;
      }
      text {
        user-select: none;
      }
    </style>
  </defs>

  <!-- 1. Canvas Background -->
  <rect width="${W}" height="${H}" fill="url(#bg-glow)"/>

  <!-- Blueprint Grid Pattern -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 34 }).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${H}"/>`).join('')}
    ${Array.from({ length: 22 }).map((_, i) => `<line x1="0" y1="${i * 50}" x2="${W}" y2="${i * 50}"/>`).join('')}
  </g>

  <!-- 2. Header & Title Section -->
  <g id="header">
    <rect x="40" y="25" width="1600" height="70" rx="14" fill="#0f111e" stroke="#1e2238" stroke-width="1.5"/>
    
    <!-- Title and Subtitle -->
    <text x="70" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="800" fill="#f8fafc" letter-spacing="0.5">
      SubTrack: <tspan fill="#38bdf8">System Architecture</tspan>
    </text>
    <text x="70" y="79" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="500" fill="#94a3b8">
      GitOps Continuous Delivery, Multi-Tier Kubernetes Orchestration &amp; Google SRE Multiwindow Observability Pipeline
    </text>

    <!-- Legend -->
    <g transform="translate(1080, 42)">
      <!-- Pipeline Flow -->
      <line x1="0" y1="12" x2="35" y2="12" stroke="url(#grad-blue)" stroke-width="3" stroke-dasharray="4 4"/>
      <circle cx="35" cy="12" r="3" fill="#a855f7"/>
      <text x="45" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="600" fill="#cbd5e1">GitOps / App Flow</text>

      <!-- Observability Flow -->
      <line x1="170" y1="12" x2="205" y2="12" stroke="url(#grad-obs)" stroke-width="3" stroke-dasharray="4 4"/>
      <circle cx="205" cy="12" r="3" fill="#f97316"/>
      <text x="215" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="600" fill="#cbd5e1">Telemetry / Alerting</text>

      <!-- Step Badge Sample -->
      <circle cx="355" cy="12" r="10" fill="#10b981"/>
      <text x="355" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle">1-7</text>
      <text x="373" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="600" fill="#cbd5e1">Pipeline Stages</text>
    </g>
  </g>

  <!-- 3. ZONES (Large labeled background boundaries) -->

  <!-- Zone 1: Source & CI -->
  <g id="zone-source-ci">
    <rect x="40" y="115" width="310" height="525" rx="16" fill="#0d111d" stroke="#252b48" stroke-width="1.5" class="zone-border"/>
    <rect x="55" y="125" width="105" height="22" rx="6" fill="#1e1b4b" stroke="#4338ca" stroke-width="1"/>
    <text x="107" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#a5b4fc" text-anchor="middle">SOURCE &amp; CI</text>
    <text x="330" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="600" fill="#64748b" text-anchor="end">GitHub Workflows</text>
  </g>

  <!-- Zone 2: GitOps Deployment -->
  <g id="zone-gitops">
    <rect x="375" y="115" width="265" height="525" rx="16" fill="#0d111d" stroke="#252b48" stroke-width="1.5" class="zone-border"/>
    <rect x="390" y="125" width="150" height="22" rx="6" fill="#2d1b4e" stroke="#7e22ce" stroke-width="1"/>
    <text x="465" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#d8b4fe" text-anchor="middle">GITOPS DEPLOYMENT</text>
    <text x="625" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="600" fill="#64748b" text-anchor="end">Continuous Delivery</text>
  </g>

  <!-- Zone 3: Kubernetes Cluster -->
  <g id="zone-k8s">
    <rect x="665" y="115" width="615" height="525" rx="16" fill="#0c1322" stroke="#1d4ed8" stroke-width="1.5"/>
    <rect x="680" y="125" width="165" height="22" rx="6" fill="#172554" stroke="#2563eb" stroke-width="1"/>
    <text x="762" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#93c5fd" text-anchor="middle">KUBERNETES CLUSTER</text>
    <text x="1260" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9.5" font-weight="600" fill="#38bdf8" text-anchor="end">kind v0.27 • Namespace: subtrack</text>
  </g>

  <!-- Zone 4: External APIs -->
  <g id="zone-apis">
    <rect x="1305" y="115" width="335" height="525" rx="16" fill="#0d111d" stroke="#252b48" stroke-width="1.5" class="zone-border"/>
    <rect x="1320" y="125" width="125" height="22" rx="6" fill="#142e2b" stroke="#0d9488" stroke-width="1"/>
    <text x="1382" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#5eead4" text-anchor="middle">EXTERNAL APIS</text>
    <text x="1625" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="600" fill="#64748b" text-anchor="end">Google Cloud Services</text>
  </g>

  <!-- Zone 5: Observability -->
  <g id="zone-observability">
    <rect x="40" y="665" width="1600" height="360" rx="16" fill="#10111a" stroke="#d97706" stroke-width="1.5"/>
    <rect x="55" y="677" width="190" height="24" rx="6" fill="#451a03" stroke="#b45309" stroke-width="1"/>
    <text x="150" y="693" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="700" fill="#fde68a" text-anchor="middle">OBSERVABILITY &amp; SRE</text>
    <text x="1620" y="693" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="#fbbf24" text-anchor="end">Namespace: observability • Multiwindow Multi-Burn-Rate Alerting</text>
  </g>

  <!-- 4. STEP 7: End User Node (Top of Ingress) -->
  ${renderCard({
    x: 885, y: 155, w: 175, h: 65,
    title: 'End User',
    subtitle: 'Browser Client / PWA',
    customIconKey: 'user',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    bg: '#0f172a'
  })}
  ${renderStepBadge(7, 885, 160)}

  <!-- 5. ZONE 1 NODES: Source & CI -->
  <!-- Developer Node -->
  ${renderCard({
    x: 60, y: 170, w: 120, h: 80,
    title: 'Developer',
    subtitle: 'git push main',
    customIconKey: 'developer',
    borderColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.2)'
  })}
  ${renderStepBadge(1, 60, 175)}

  <!-- GitHub Repo Node -->
  ${renderCard({
    x: 215, y: 170, w: 120, h: 80,
    title: 'GitHub Repo',
    subtitle: 'sub_tracker.git',
    iconKeys: ['github'],
    borderColor: '#475569',
    glowColor: 'rgba(100, 116, 139, 0.2)'
  })}

  <!-- GitHub Actions CI Node -->
  ${renderCard({
    x: 100, y: 310, w: 200, h: 90,
    title: 'GitHub Actions',
    subtitle: 'CI Build &amp; Test Matrix',
    iconKeys: ['githubactions'],
    badge: 'CI Pipeline',
    borderColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.25)'
  })}

  <!-- Docker Container Registry Node (Centered under GitHub Actions) -->
  ${renderCard({
    x: 135, y: 460, w: 140, h: 90,
    title: 'Docker Hub',
    subtitle: 'subtrack-*:sha',
    iconKeys: ['docker'],
    borderColor: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.25)'
  })}

  <!-- 6. ZONE 2 NODES: GitOps Deployment -->
  <!-- ArgoCD Controller Node -->
  ${renderCard({
    x: 405, y: 220, w: 210, h: 105,
    title: 'ArgoCD',
    subtitle: 'Auto-Sync &amp; Self-Healing',
    iconKeys: ['argocd'],
    badge: 'GitOps Controller',
    borderColor: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.25)'
  })}
  ${renderStepBadge(2, 405, 225)}

  <!-- Sealed Secrets Controller Node (Step 6 Lock) -->
  ${renderCard({
    x: 405, y: 430, w: 210, h: 105,
    title: 'Sealed Secrets',
    subtitle: 'Bitnami Crypto Operator',
    customIconKey: 'lock',
    badge: 'SecOps',
    borderColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    bg: '#062016'
  })}
  ${renderStepBadge(6, 405, 435)}

  <!-- 7. ZONE 3 NODES: Kubernetes Cluster (subtrack) -->

  <!-- Ingress Controller Node -->
  ${renderCard({
    x: 885, y: 260, w: 175, h: 70,
    title: 'Nginx Ingress',
    subtitle: 'Host: 192.168.1.20.nip.io',
    iconKeys: ['nginx'],
    badge: 'TLS Ingress',
    borderColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.2)'
  })}

  <!-- Frontend Pods Node -->
  ${renderCard({
    x: 695, y: 375, w: 235, h: 100,
    title: 'Frontend Pods (x2)',
    subtitle: 'React 19 + Tailwind + Nginx',
    iconKeys: ['react', 'tailwind', 'nginx'],
    badge: 'PDB: min 1',
    borderColor: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.25)'
  })}
  ${renderStepBadge(3, 695, 380)}

  <!-- Backend Pods Node (HPA scaled) -->
  ${renderCard({
    x: 1005, y: 375, w: 245, h: 100,
    title: 'Backend Pods (x2–6 HPA)',
    subtitle: 'Node.js 20 • Express 5 • /metrics',
    iconKeys: ['nodejs', 'express'],
    badge: 'HPA @ 70% CPU',
    borderColor: '#16a34a',
    glowColor: 'rgba(22, 163, 74, 0.25)'
  })}

  <!-- Renewal Scan CronJob Node -->
  ${renderCard({
    x: 695, y: 520, w: 235, h: 95,
    title: 'Renewal Scan CronJob',
    subtitle: 'Schedule: 0 9 * * * (Daily UTC)',
    customIconKey: 'clock',
    badge: 'Batch Job',
    borderColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.2)'
  })}

  <!-- MongoDB Pod Node -->
  ${renderCard({
    x: 1005, y: 520, w: 245, h: 95,
    title: 'MongoDB (v7)',
    subtitle: 'PVC: mongo-data-pvc (Persistent)',
    iconKeys: ['mongodb'],
    badge: 'Database',
    borderColor: '#15803d',
    glowColor: 'rgba(21, 128, 61, 0.25)'
  })}

  <!-- 8. ZONE 4 NODES: External APIs -->
  <!-- Google Gemini API Node -->
  ${renderCard({
    x: 1335, y: 220, w: 275, h: 105,
    title: 'Google Gemini API',
    subtitle: 'LLM Email Parsing &amp; Categorization',
    iconKeys: ['gemini'],
    badge: 'Generative AI',
    borderColor: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.3)'
  })}
  ${renderStepBadge(4, 1335, 225)}

  <!-- Gmail API Node -->
  ${renderCard({
    x: 1335, y: 430, w: 275, h: 105,
    title: 'Gmail API (OAuth 2.0)',
    subtitle: 'Read-Only Subscription Email Parsing',
    iconKeys: ['gmail'],
    badge: 'OAuth Read-Only',
    borderColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.3)'
  })}

  <!-- 9. ZONE 5 NODES: Observability Stack -->
  <!-- Kube-State-Metrics Node -->
  ${renderCard({
    x: 70, y: 770, w: 220, h: 105,
    title: 'Kube-State-Metrics',
    subtitle: 'Cluster, HPA &amp; Pod Health Metrics',
    iconKeys: ['kubernetes'],
    badge: 'Telemetry',
    borderColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.25)'
  })}

  <!-- Prometheus Node -->
  ${renderCard({
    x: 360, y: 750, w: 290, h: 140,
    title: 'Prometheus Server',
    subtitle: 'Scrapes /metrics • Evaluates SLO Burn-Rate Rules',
    iconKeys: ['prometheus'],
    badge: 'Metrics TSDB',
    borderColor: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.3)',
    bg: '#1a1012'
  })}
  ${renderStepBadge(5, 360, 755)}

  <!-- Alertmanager Node -->
  ${renderCard({
    x: 720, y: 750, w: 290, h: 140,
    title: 'Alertmanager',
    subtitle: 'Fast Burn (14.4x / 2m) • Slow Burn (3x / 15m)',
    customIconKey: 'bell',
    badge: 'Multi-Burn-Rate',
    borderColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.3)',
    bg: '#200e12'
  })}

  <!-- Webhook Logger / Notifications Node -->
  ${renderCard({
    x: 1080, y: 770, w: 235, h: 105,
    title: 'Alert Webhook Logger',
    subtitle: 'Audit &amp; Alert Event Logger',
    customIconKey: 'terminal',
    badge: 'Receiver',
    borderColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.25)'
  })}

  <!-- Grafana Dashboards Node -->
  ${renderCard({
    x: 1380, y: 750, w: 235, h: 140,
    title: 'Grafana Dashboards',
    subtitle: 'SRE Golden Signals, SLO Error Budgets &amp; HPA',
    iconKeys: ['grafana'],
    badge: 'Visualization',
    borderColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    bg: '#1c140d'
  })}

  <!-- 10. CONNECTORS (Flow Lines with Animated Flowing Dashes) -->

  <!-- STEP 7: End User -> Ingress -->
  ${renderConnector({
    id: 'conn-user-ingress',
    d: 'M 972 220 L 972 260',
    label: 'HTTPS (nip.io / :8082)',
    labelX: 972, labelY: 240
  })}

  <!-- STEP 1: Developer -> GitHub -->
  ${renderConnector({
    id: 'conn-dev-github',
    d: 'M 180 210 L 215 210',
    label: 'push',
    labelX: 198, labelY: 200
  })}

  <!-- GitHub -> GitHub Actions -->
  ${renderConnector({
    id: 'conn-github-actions',
    d: 'M 275 250 L 275 285 L 200 285 L 200 310',
    label: 'triggers workflow',
    labelX: 237, labelY: 285
  })}

  <!-- GitHub Actions -> Docker Registry -->
  ${renderConnector({
    id: 'conn-actions-docker',
    d: 'M 200 400 L 200 460',
    label: 'build &amp; push image',
    labelX: 200, labelY: 430
  })}

  <!-- STEP 2: Registry / Manifests -> ArgoCD -->
  ${renderConnector({
    id: 'conn-docker-argocd',
    d: 'M 275 505 L 365 505 L 365 240 L 405 240',
    label: 'pull image tags &amp; manifests',
    labelX: 365, labelY: 340
  })}

  <!-- STEP 6: Sealed Secrets -> ArgoCD / Cluster (Adjusted path) -->
  ${renderConnector({
    id: 'conn-sealedsecrets-cluster',
    d: 'M 615 505 L 655 505 L 655 450 L 695 450',
    label: 'decrypts subtrack-secret',
    labelX: 655, labelY: 480
  })}

  <!-- ArgoCD -> Kubernetes Cluster (GitOps Reconcile) -->
  ${renderConnector({
    id: 'conn-argocd-cluster',
    d: 'M 615 272 L 655 272 L 655 295 L 885 295',
    label: 'auto-sync &amp; reconcile state',
    labelX: 750, labelY: 285
  })}

  <!-- Ingress -> Frontend Pods -->
  ${renderConnector({
    id: 'conn-ingress-frontend',
    d: 'M 910 330 L 910 350 L 812 350 L 812 375',
    label: 'routes /',
    labelX: 861, labelY: 350
  })}

  <!-- Ingress -> Backend Pods -->
  ${renderConnector({
    id: 'conn-ingress-backend',
    d: 'M 1030 330 L 1030 350 L 1127 350 L 1127 375',
    label: 'routes /api',
    labelX: 1078, labelY: 350
  })}

  <!-- Frontend -> Backend Pods -->
  ${renderConnector({
    id: 'conn-frontend-backend',
    d: 'M 930 425 L 1005 425',
    label: 'API requests',
    labelX: 967, labelY: 415
  })}

  <!-- Backend -> MongoDB -->
  ${renderConnector({
    id: 'conn-backend-mongo',
    d: 'M 1127 475 L 1127 520',
    label: 'CRUD read/write',
    labelX: 1127, labelY: 497
  })}

  <!-- Renewal Scan CronJob -> Backend / DB -->
  ${renderConnector({
    id: 'conn-cron-backend',
    d: 'M 930 567 L 1005 567',
    label: 'triggers daily scan',
    labelX: 967, labelY: 557
  })}

  <!-- STEP 4: Backend -> Gemini API -->
  ${renderConnector({
    id: 'conn-backend-gemini',
    d: 'M 1250 405 L 1290 405 L 1290 272 L 1335 272',
    label: 'prompt email payload',
    labelX: 1290, labelY: 338
  })}

  <!-- STEP 4: Backend -> Gmail API -->
  ${renderConnector({
    id: 'conn-backend-gmail',
    d: 'M 1250 445 L 1290 445 L 1290 482 L 1335 482',
    label: 'OAuth 2.0 query',
    labelX: 1290, labelY: 463
  })}

  <!-- STEP 5 (OBSERVABILITY CONNECTORS - AMBER / ORANGE) -->
  <!-- Backend Pods -> Prometheus (Scrape) -->
  ${renderConnector({
    id: 'conn-backend-prom',
    d: 'M 1060 475 L 1060 710 L 505 710 L 505 750',
    label: 'scrapes /metrics (prom-client)',
    labelX: 782, labelY: 710,
    isObs: true
  })}

  <!-- Kube-State-Metrics -> Prometheus -->
  ${renderConnector({
    id: 'conn-ksm-prom',
    d: 'M 290 822 L 360 822',
    label: 'k8s telemetry',
    labelX: 325, labelY: 812,
    isObs: true
  })}

  <!-- Prometheus -> Alertmanager (Fire Alerts) -->
  ${renderConnector({
    id: 'conn-prom-alertmgr',
    d: 'M 650 820 L 720 820',
    label: 'fires burn-rate alerts',
    labelX: 685, labelY: 810,
    isObs: true
  })}

  <!-- Alertmanager -> Webhook Logger -->
  ${renderConnector({
    id: 'conn-alertmgr-webhook',
    d: 'M 1010 822 L 1080 822',
    label: 'HTTP webhook dispatch',
    labelX: 1045, labelY: 812,
    isObs: true
  })}

  <!-- Prometheus -> Grafana (PromQL Queries) -->
  ${renderConnector({
    id: 'conn-prom-grafana',
    d: 'M 505 890 L 505 925 L 1497 925 L 1497 890',
    label: 'PromQL Datasource Queries (Golden Signals &amp; Error Budget)',
    labelX: 1000, labelY: 925,
    isObs: true
  })}

</svg>`;
};

// Main execution
const run = async () => {
  const svgContent = generateSVG();
  const docsDir = path.resolve('c:/MY WORK/subtrack/docs');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const svgPath = path.join(docsDir, 'architecture.svg');
  const pngPath = path.join(docsDir, 'architecture.png');

  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Successfully wrote docs/architecture.svg (' + svgContent.length + ' bytes)');

  // Render PNG with resvg
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: 2520 // 1.5x crisp high-res render (2520 x 1590)
    },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Segoe UI'
    }
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);
  console.log('Successfully rendered docs/architecture.png (' + pngBuffer.length + ' bytes)');
};

run().catch(err => {
  console.error('Error generating architecture diagram:', err);
  process.exit(1);
});
