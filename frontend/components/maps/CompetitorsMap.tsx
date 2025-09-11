"use client";

import { useEffect, useMemo, useRef } from "react";
import L, { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
(L.Marker.prototype as any).options.icon = defaultIcon;

type Ponto = {
  nome: string;
  lat: number;
  lng: number;
  categoria: string;
};

type Props = {
  center: [number, number];
  zoom?: number;
  jsonUrl: string;              // ex.: "/data/pontos.json"
  focusCategories?: string[];   // liga só essas camadas (se vier vazio, começa tudo desligado)
  autoFit?: boolean;            // faz fitBounds nas camadas ligadas
  className?: string;
};

/** Corrige os ícones default do Leaflet (sem isso aparece um quadrado com “Marker”) */
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

export default function CompetitorsMap({
  center,
  zoom = 14,
  jsonUrl,
  focusCategories = [],
  autoFit = true,
  className,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const controlRef = useRef<L.Control.Layers | null>(null);
  const baseLayersRef = useRef<{ [k: string]: L.TileLayer }>({});
  const overlayGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  /** cria o mapa só uma vez */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("competitors-map", {
      center,
      zoom,
      zoomControl: true,
    });
    mapRef.current = map;

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
    ).addTo(map);

    const hot = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          "© OpenStreetMap contributors, Tiles style by HOT, hosted by OSM France",
      }
    );

    baseLayersRef.current = { OpenStreetMap: osm, "OpenStreetMap.HOT": hot };

    controlRef.current = L.control
      .layers(baseLayersRef.current, {}, { collapsed: false })
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      controlRef.current = null;
      overlayGroupsRef.current = {};
    };
  }, [center, zoom]);

  /** carrega pontos.json e (re)monta as camadas */
  useEffect(() => {
    if (!mapRef.current) return;

    // limpa overlays anteriores (e o control correspondente)
    Object.values(overlayGroupsRef.current).forEach((g) => {
      if (mapRef.current!.hasLayer(g)) mapRef.current!.removeLayer(g);
    });
    overlayGroupsRef.current = {};
    controlRef.current?.remove();
    controlRef.current = L.control
      .layers(baseLayersRef.current, {}, { collapsed: false })
      .addTo(mapRef.current);

    let cancelled = false;

    (async () => {
      const resp = await fetch(jsonUrl);
      const pontos: Ponto[] = await resp.json();

      if (cancelled) return;

      // cria um layerGroup por categoria
      const byCat = new Map<string, L.LayerGroup>();
      for (const p of pontos) {
        if (!byCat.has(p.categoria)) {
          byCat.set(p.categoria, L.layerGroup());
        }
        const m = L.marker([p.lat, p.lng]).bindPopup(
          `<b>${p.nome}</b><br>${p.categoria}`
        );
        byCat.get(p.categoria)!.addLayer(m);
      }

      // adiciona os grupos ao controle; liga apenas os do "focusCategories"
      const map = mapRef.current!;
      const toFit: L.LatLngExpression[] = [];
      byCat.forEach((group, cat) => {
        overlayGroupsRef.current[cat] = group;
        controlRef.current!.addOverlay(group, cat);
        const shouldEnable =
          focusCategories.length > 0 && focusCategories.includes(cat);
        if (shouldEnable) {
          group.addTo(map); // checkbox aparece marcado
          // junta coordenadas p/ fitBounds
          group.eachLayer((l: any) => {
            if (l.getLatLng) toFit.push(l.getLatLng());
          });
        }
      });

      // somente faz fitBounds quando houver algo ligado
      if (autoFit && toFit.length > 0) {
        const b = new LatLngBounds(toFit);
        map.fitBounds(b.pad(0.15));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jsonUrl, focusCategories, autoFit]);

  /** quando foco muda, liga/desliga as camadas sem reconstruir os pontos */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // se não foi passado foco, não força seleção
    if (focusCategories.length === 0) return;

    const toFit: L.LatLngExpression[] = [];
    for (const [cat, group] of Object.entries(overlayGroupsRef.current)) {
      const want = focusCategories.includes(cat);
      const has = map.hasLayer(group);
      if (want && !has) {
        group.addTo(map);
      } else if (!want && has) {
        map.removeLayer(group);
      }
      if (want) {
        group.eachLayer((l: any) => {
          if (l.getLatLng) toFit.push(l.getLatLng());
        });
      }
    }
    if (autoFit && toFit.length > 0) {
      const b = new LatLngBounds(toFit);
      map.fitBounds(b.pad(0.15));
    }
  }, [focusCategories, autoFit]);

  return <div id="competitors-map" className={className} />;
}