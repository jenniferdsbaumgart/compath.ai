"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

type Ponto = { nome: string; lat: number; lng: number; categoria: string };

type Props = {
  /** centro do mapa */
  center: [number, number];
  /** zoom inicial (default: 13) */
  zoom?: number;
  /** URL do JSON (p.ex. /data/pontos.json) */
  jsonUrl: string;
  /** quais categorias já começam ligadas (liga só as relacionadas à busca) */
  focusCategories?: string[];
  /** tenta ajustar o mapa aos pontos carregados */
  autoFit?: boolean;
  className?: string;
};

/** normaliza rótulos sing/plural do dataset para os nomes exibidos no controle */
function normalizeCategory(c: string) {
  const map: Record<string, string> = {
    "Loja de Produtos Naturais": "Lojas de Produtos Naturais",
    Barbearia: "Barbearias",
    "Estúdio de Pilates": "Estúdios de Pilates",
    "Salão de Beleza": "Salões de Beleza",
    "Agência de Viagens": "Agências de Viagens",
    Brechó: "Brechós",
  };
  return map[c] ?? c;
}

const ALL_CATEGORIES = [
  "Lojas de Produtos Naturais",
  "Barbearias",
  "Mercearias",
  "Estúdios de Pilates",
  "Papelarias",
  "Salões de Beleza",
  "Padarias",
  "Distribuidoras de Bebidas",
  "Agências de Viagens",
  "Lanchonetes",
  "Brechós",
];

export default function CompetitorsMap({
  center,
  zoom = 13,
  jsonUrl,
  focusCategories = [],
  autoFit = true,
  className,
}: Props) {
  /** instâncias permanentes (evita recriar mapa/controles a cada render) */
  const mapRef = useRef<L.Map | null>(null);
  const controlRef = useRef<L.Control.Layers | null>(null);
  const overlaysRef = useRef<Record<string, L.LayerGroup>>({});
  const allMarkersRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  /** cria o mapa uma única vez */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("competitors-map", { center, zoom });
    mapRef.current = map;

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
    ).addTo(map);

    const hot = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution:
          "© OpenStreetMap contributors, tiles style HOT by OpenStreetMap France",
        maxZoom: 19,
      }
    );

    const control = L.control
      .layers({ OpenStreetMap: osm, "OpenStreetMap.HOT": hot }, undefined, {
        collapsed: false,
      })
      .addTo(map);
    controlRef.current = control;

    // cria todos os grupos, mas **não** adiciona ao mapa ainda
    ALL_CATEGORIES.forEach((cat) => {
      const g = L.layerGroup();
      overlaysRef.current[cat] = g;
      control.addOverlay(g, cat);
    });

    // grupo auxiliar só para manter bounds/facilitar clear
    map.addLayer(allMarkersRef.current);

    // cleanup ao desmontar
    return () => {
      map.remove();
      mapRef.current = null;
      controlRef.current = null;
      overlaysRef.current = {};
      allMarkersRef.current = new L.FeatureGroup();
    };
  }, [center, zoom]);

  /** carrega/repovoa os pontos do JSON */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    async function load() {
      const res = await fetch(jsonUrl);
      if (!res.ok) return; // silencioso no MVP
      const pontos = (await res.json()) as Ponto[];

      // limpa tudo antes de desenhar de novo
      allMarkersRef.current.clearLayers();
      Object.values(overlaysRef.current).forEach((g) => g.clearLayers());

      const bounds = new L.LatLngBounds([]);

      pontos.forEach((p) => {
        const cat = normalizeCategory(p.categoria);
        const group = overlaysRef.current[cat];
        if (!group) return;

        const m = L.marker([p.lat, p.lng]).bindPopup(
          `<b>${p.nome}</b><br>${cat}`
        );

        group.addLayer(m);
        allMarkersRef.current.addLayer(m);
        bounds.extend(m.getLatLng());
      });

      const map = mapRef.current;
      if (autoFit && map && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jsonUrl, autoFit]);

  /** liga/desliga camadas de acordo com o foco */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const showAll = focusCategories.length === 0;

    ALL_CATEGORIES.forEach((cat) => {
      const g = overlaysRef.current[cat];
      if (!g) return;

      const shouldShow = showAll || focusCategories.includes(cat);

      if (shouldShow && !map.hasLayer(g)) map.addLayer(g);
      if (!shouldShow && map.hasLayer(g)) map.removeLayer(g);
    });
  }, [focusCategories]);

  return (
    <div
      id="competitors-map"
      className={className ?? "h-[420px] w-full rounded-md overflow-hidden"}
    />
  );
}
