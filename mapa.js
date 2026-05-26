/**
 * Mapa de rotas EcoColeta — Leaflet + OSRM (apenas na home, seção EcoPontos).
 */
(function () {
  'use strict';

  const FALLBACK_ECOPONTOS = [
    {
      id: 'juazeiro-centro',
      name: 'EcoPonto Juazeiro Centro',
      address: 'Centro, Juazeiro do Norte',
      city: 'Juazeiro do Norte',
      lat: -7.2127,
      lng: -39.3155,
    },
    {
      id: 'juazeiro-lagoa-seca',
      name: 'EcoPonto Lagoa Seca',
      address: 'Lagoa Seca, Juazeiro do Norte',
      city: 'Juazeiro do Norte',
      lat: -7.2468,
      lng: -39.3042,
    },
    {
      id: 'juazeiro-piraja',
      name: 'EcoPonto Pirajá',
      address: 'Pirajá, Juazeiro do Norte',
      city: 'Juazeiro do Norte',
      lat: -7.1972,
      lng: -39.3238,
    },
    {
      id: 'crato-centro',
      name: 'EcoPonto Crato Centro',
      address: 'Centro, Crato',
      city: 'Crato',
      lat: -7.2343,
      lng: -39.4097,
    },
    {
      id: 'crato-seminario',
      name: 'EcoPonto Seminário',
      address: 'Seminário, Crato',
      city: 'Crato',
      lat: -7.2267,
      lng: -39.4275,
    },
    {
      id: 'barbalha-centro',
      name: 'EcoPonto Barbalha Centro',
      address: 'Centro, Barbalha',
      city: 'Barbalha',
      lat: -7.3124,
      lng: -39.3049,
    },
    {
      id: 'barbalha-parque',
      name: 'EcoPonto Parque da Cidade',
      address: 'Parque da Cidade, Barbalha',
      city: 'Barbalha',
      lat: -7.2998,
      lng: -39.2926,
    },
    {
      id: 'missao-velha-centro',
      name: 'EcoPonto Missão Velha Centro',
      address: 'Centro, Missão Velha',
      city: 'Missão Velha',
      lat: -7.2497,
      lng: -39.1437,
    },
    {
      id: 'caririacu-centro',
      name: 'EcoPonto Caririaçu Centro',
      address: 'Centro, Caririaçu',
      city: 'Caririaçu',
      lat: -7.0428,
      lng: -39.2848,
    },
    {
      id: 'jardim-centro',
      name: 'EcoPonto Jardim Centro',
      address: 'Centro, Jardim',
      city: 'Jardim',
      lat: -7.5755,
      lng: -39.2826,
    },
    {
      id: 'milagres-centro',
      name: 'EcoPonto Milagres Centro',
      address: 'Centro, Milagres',
      city: 'Milagres',
      lat: -7.3138,
      lng: -38.9458,
    },
    {
      id: 'nova-olinda-centro',
      name: 'EcoPonto Nova Olinda Centro',
      address: 'Centro, Nova Olinda',
      city: 'Nova Olinda',
      lat: -7.0866,
      lng: -39.6803,
    },
    {
      id: 'santana-cariri-centro',
      name: 'EcoPonto Santana do Cariri',
      address: 'Centro, Santana do Cariri',
      city: 'Santana do Cariri',
      lat: -7.1774,
      lng: -39.7371,
    },
    {
      id: 'farias-brito-centro',
      name: 'EcoPonto Farias Brito Centro',
      address: 'Centro, Farias Brito',
      city: 'Farias Brito',
      lat: -6.9308,
      lng: -39.5656,
    },
    {
      id: 'brejo-santo-centro',
      name: 'EcoPonto Brejo Santo Centro',
      address: 'Centro, Brejo Santo',
      city: 'Brejo Santo',
      lat: -7.4929,
      lng: -38.9877,
    },
  ];

  let ECOPONTOS = FALLBACK_ECOPONTOS.slice();

  const DEFAULT_ORIGIN = { lat: -7.2325, lng: -39.312 };

  /** Demo São Paulo — painel ADM quando não há coordenadas no backend */
  const DEFAULT_SAOPAULO_ECOPONTO = { lat: -23.5489, lng: -46.6388 };

  const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

  const PROFILE_ALIASES = {
    foot: ['walking', 'foot'],
    car: ['driving', 'car'],
  };

  const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  const CARIRI_BBOX = {
    south: -7.72,
    west: -39.82,
    north: -6.86,
    east: -38.82,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function formatDuration(totalSeconds) {
    const m = Math.round(totalSeconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  }

  function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  function urbanDelaySeconds(distanceKm, mode) {
    const km = Math.max(0, distanceKm);
    switch (mode) {
      case 'walk':
        return km * 42;
      case 'car':
        return km * 52;
      case 'moto':
        return km * 38;
      case 'transit':
        return km * 48;
      default:
        return 0;
    }
  }

  function estimateTransitSeconds(carDistanceMeters, carDurationSeconds) {
    const km = carDistanceMeters / 1000;
    const effectiveKmh = 14;
    const moving = (km / effectiveKmh) * 3600;
    const boardingWait = 240;
    return moving + urbanDelaySeconds(km, 'transit') + boardingWait * 0.35 + carDurationSeconds * 0.08;
  }

  function coordsPair(lat, lng) {
    return `${lng},${lat}`;
  }

  function normalizeId(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  function inferCity(tags) {
    const raw =
      tags['addr:city'] ||
      tags['is_in:city'] ||
      tags['addr:municipality'] ||
      tags.city ||
      '';
    return String(raw || '').trim();
  }

  function addressFromTags(tags, cityFallback) {
    const street = tags['addr:street'] || tags.street || '';
    const number = tags['addr:housenumber'] || '';
    const neighbourhood = tags['addr:suburb'] || tags['addr:neighbourhood'] || tags.neighbourhood || '';
    const city = inferCity(tags) || cityFallback || 'Cariri';
    const parts = [];
    if (street) parts.push(number ? `${street}, ${number}` : street);
    if (neighbourhood) parts.push(neighbourhood);
    parts.push(city);
    return parts.join(' • ');
  }

  function normalizeOsmEcoponto(el, index) {
    const tags = el.tags || {};
    const lat = typeof el.lat === 'number' ? el.lat : el.center && el.center.lat;
    const lng = typeof el.lon === 'number' ? el.lon : el.center && el.center.lon;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    const city = inferCity(tags);
    const fallbackName = city ? `EcoPonto ${city}` : 'EcoPonto de reciclagem';
    const name = tags.name || tags.operator || fallbackName;
    return {
      id: `osm-${el.type}-${el.id || index}`,
      name: String(name).trim(),
      address: addressFromTags(tags, city),
      city,
      lat,
      lng,
      source: 'osm',
    };
  }

  function mergeEcopontos(osmPoints) {
    const merged = [];
    const seen = new Set();

    osmPoints.concat(FALLBACK_ECOPONTOS).forEach((p) => {
      if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      const key = `${normalizeId(p.name)}:${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(p);
    });

    return merged.sort((a, b) => {
      const ca = (a.city || '').localeCompare(b.city || '', 'pt-BR');
      return ca || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  async function fetchOsmEcopontos() {
    const b = CARIRI_BBOX;
    const query = `
      [out:json][timeout:12];
      (
        node["amenity"="recycling"](${b.south},${b.west},${b.north},${b.east});
        way["amenity"="recycling"](${b.south},${b.west},${b.north},${b.east});
        relation["amenity"="recycling"](${b.south},${b.west},${b.north},${b.east});
        node["recycling_type"](${b.south},${b.west},${b.north},${b.east});
        way["recycling_type"](${b.south},${b.west},${b.north},${b.east});
      );
      out center tags 80;
    `;

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ data: query }).toString(),
    });
    if (!res.ok) throw new Error('OpenStreetMap indisponível.');

    const data = await res.json();
    const points = Array.isArray(data.elements)
      ? data.elements.map(normalizeOsmEcoponto).filter(Boolean)
      : [];

    return mergeEcopontos(points);
  }

  async function fetchOsrmRoute(profileKey, from, to) {
    const coords = `${coordsPair(from.lat, from.lng)};${coordsPair(to.lat, to.lng)}`;
    const aliases = PROFILE_ALIASES[profileKey] || [profileKey];
    let lastErr = null;

    for (let i = 0; i < aliases.length; i++) {
      const profile = aliases[i];
      const url = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&steps=false`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          lastErr = new Error('Falha na rede de rotas.');
          continue;
        }
        const data = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const r = data.routes[0];
          return {
            duration: r.duration,
            distance: r.distance,
            geometry: r.geometry,
          };
        }
        lastErr = new Error('Não foi possível traçar a rota para estes pontos.');
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('Serviço de rotas indisponível.');
  }

  function geometryToLatLngs(geometry) {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map((c) => [c[1], c[0]]);
  }

  function cepDigitsOnly(value) {
    const d = String(value || '').replace(/\D/g, '');
    return d.length === 8 ? d : null;
  }

  function formatCep(cep8) {
    return `${cep8.slice(0, 5)}-${cep8.slice(5)}`;
  }

  function getStoredUserCep() {
    try {
      return cepDigitsOnly(localStorage.getItem('userCep'));
    } catch (e) {
      return null;
    }
  }

  async function fetchViaCep(cep8) {
    const res = await fetch(`https://viacep.com.br/ws/${cep8}/json/`);
    if (!res.ok) throw new Error('Não foi possível consultar o CEP.');
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado ou inválido.');
    return data;
  }

  async function nominatimGeocodeQuery(q) {
    const res = await fetch(`geocode-nominatim.php?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Geocodificação indisponível no servidor.');
    const data = await res.json();
    if (data && data._proxy_error) throw new Error('Geocodificação temporariamente indisponível.');
    if (!Array.isArray(data) || data.length === 0) return null;
    const hit = data[0];
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  }

  async function geocodeAddressFromViaCep(data, cep8) {
    const parts = [];
    if (data.logradouro) parts.push(data.logradouro);
    if (data.bairro) parts.push(data.bairro);
    parts.push(`${data.localidade}, ${data.uf}, Brasil`);

    let geo = await nominatimGeocodeQuery(parts.join(', '));
    if (!geo && data.localidade) {
      geo = await nominatimGeocodeQuery(`${data.localidade}, ${data.uf}, Brasil`);
    }
    if (!geo && data.localidade) {
      geo = await nominatimGeocodeQuery(`${cep8}, ${data.localidade}, ${data.uf}, Brasil`);
    }
    return geo;
  }

  const ecopontoIcon = L.divIcon({
    className: 'eco-marker',
    html: '<span class="eco-marker__symbol" aria-hidden="true"><span class="eco-marker__glyph">♻</span></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
    tooltipAnchor: [0, -38],
  });

  /**
   * @param {object} cfg
   * @param {string} cfg.mapElId
   * @param {string} cfg.selectId
   * @param {string} [cfg.locateBtnId]
   * @param {string} [cfg.recalcBtnId]
   * @param {string} [cfg.statusId]
   * @param {string} [cfg.timesPanelId]
   * @param {string} [cfg.cepInputId]
   * @param {string} [cfg.cepBtnId]
   */
  function createRouteWidget(cfg) {
    let map = null;
    let routeLayer = null;
    let markersLayer = null;
    let currentOrigin = { ...DEFAULT_ORIGIN };
    let hasRouteOrigin = false;
    let originDescription =
      '<strong>Sua partida</strong><br>Centro estimado em Crato–CE. Informe seu CEP ou use o GPS.';

    function setStatus(msg, isError) {
      const el = cfg.statusId ? $(cfg.statusId) : null;
      if (!el) return;
      el.textContent = msg || '';
      el.classList.toggle('is-error', !!isError);
    }

    function fillSelect() {
      const sel = $(cfg.selectId);
      if (!sel) return;
      sel.innerHTML = ECOPONTOS.map(
        (p) => `<option value="${p.id}">${p.name} — ${p.city || p.address}</option>`
      ).join('');
    }

    function publishEcopontos() {
      const points = ECOPONTOS.map((p) => ({ ...p }));
      window.EcoColetaEcopontos = points;
      window.dispatchEvent(new CustomEvent('ecocoleta:ecopontos-loaded', {
        detail: { ecopontos: points },
      }));
    }

    function publishSelectedEcoponto(dest) {
      if (!dest) return;
      window.dispatchEvent(new CustomEvent('ecocoleta:ecoponto-selected', {
        detail: { ecoponto: { ...dest }, id: dest.id },
      }));
    }

    function getSelectedPonto() {
      const sel = $(cfg.selectId);
      const id = sel ? sel.value : ECOPONTOS[0].id;
      return ECOPONTOS.find((p) => p.id === id) || ECOPONTOS[0];
    }

    function initMap() {
      map = L.map(cfg.mapElId, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([currentOrigin.lat, currentOrigin.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      routeLayer = L.layerGroup().addTo(map);
      markersLayer = L.layerGroup().addTo(map);
    }

    function drawRoute(latlngs, dest) {
      routeLayer.clearLayers();
      markersLayer.clearLayers();

      if (!latlngs.length) return;

      const line = L.polyline(latlngs, {
        color: '#0f6b3a',
        weight: 6,
        opacity: 0.92,
        lineJoin: 'round',
        lineCap: 'round',
      });
      line.addTo(routeLayer);

      L.polyline(latlngs, {
        color: '#8fffc7',
        weight: 2,
        opacity: 1,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(routeLayer);

      L.circleMarker([currentOrigin.lat, currentOrigin.lng], {
        radius: 10,
        color: '#0f2c21',
        fillColor: '#8fffc7',
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(markersLayer)
        .bindPopup(originDescription);

      L.marker([dest.lat, dest.lng], { icon: ecopontoIcon })
        .addTo(markersLayer)
        .bindTooltip(dest.name, {
          direction: 'top',
          offset: [0, -8],
          opacity: 1,
          className: 'eco-marker-tooltip',
        })
        .bindPopup(`<strong>${dest.name}</strong><br>${dest.address}`)
        .on('click', () => publishSelectedEcoponto(dest));

      const bounds = line.getBounds().extend([currentOrigin.lat, currentOrigin.lng]).extend([dest.lat, dest.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    function showAllEcopontos(statusMessage) {
      const panel = cfg.timesPanelId ? $(cfg.timesPanelId) : null;
      routeLayer.clearLayers();
      markersLayer.clearLayers();
      if (panel) panel.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('ecocoleta:route-times-clear'));

      const bounds = [];
      ECOPONTOS.forEach((p) => {
        L.marker([p.lat, p.lng], { icon: ecopontoIcon })
          .addTo(markersLayer)
          .bindTooltip(p.name, {
            direction: 'top',
            offset: [0, -8],
            opacity: 1,
            className: 'eco-marker-tooltip',
          })
          .bindPopup(`<strong>${p.name}</strong><br>${p.address}`)
          .on('click', () => publishSelectedEcoponto(p));
        bounds.push([p.lat, p.lng]);
      });

      if (bounds.length) {
        map.fitBounds(bounds, { padding: [72, 72], maxZoom: 11 });
      }

      setStatus(
        statusMessage ||
          'Informe o CEP de partida ou use sua localização para traçar a rota. Enquanto isso, exibimos ecopontos de Juazeiro, Crato, Barbalha, Missão Velha e cidades próximas.'
      );
    }

    async function calcularRota() {
      const dest = getSelectedPonto();
      const panel = cfg.timesPanelId ? $(cfg.timesPanelId) : null;

      if (!hasRouteOrigin) {
        showAllEcopontos();
        return;
      }

      setStatus('Calculando rotas…');

      try {
        const [footRoute, carRoute] = await Promise.all([
          fetchOsrmRoute('foot', currentOrigin, dest),
          fetchOsrmRoute('car', currentOrigin, dest),
        ]);

        const latlngs = geometryToLatLngs(carRoute.geometry);
        drawRoute(latlngs, dest);

        const walkKm = footRoute.distance / 1000;
        const carKm = carRoute.distance / 1000;

        const walkSec = footRoute.duration + urbanDelaySeconds(walkKm, 'walk');
        const carSec = carRoute.duration + urbanDelaySeconds(carKm, 'car');
        const motoSec = carRoute.duration * 0.88 + urbanDelaySeconds(carKm, 'moto');
        const transitSec = estimateTransitSeconds(carRoute.distance, carRoute.duration);

        if (panel) {
          window.dispatchEvent(new CustomEvent('ecocoleta:route-times', {
            detail: {
              walk: {
                time: formatDuration(walkSec),
                detail: formatDistance(footRoute.distance),
              },
              car: {
                time: formatDuration(carSec),
                detail: formatDistance(carRoute.distance),
              },
              moto: {
                time: formatDuration(motoSec),
                detail: 'tempo típico de moto',
              },
              transit: {
                time: formatDuration(transitSec),
                detail: 'ônibus + espera média',
              },
            },
          }));
          panel.classList.remove('hidden');
        }

        setStatus(
          `Distância pela via (carro): ${formatDistance(carRoute.distance)} · Caminho a pé (rede de pedestres): ${formatDistance(footRoute.distance)}`
        );
      } catch (e) {
        console.error(e);
        if (panel) panel.classList.add('hidden');
        window.dispatchEvent(new CustomEvent('ecocoleta:route-times-clear'));
        routeLayer.clearLayers();
        markersLayer.clearLayers();
        setStatus(e.message || 'Erro ao calcular rota. Tente outro ecoponto ou mais tarde.', true);
      }
    }

    function usarMinhaLocalizacao() {
      setStatus('Obtendo localização…');
      if (!navigator.geolocation) {
        setStatus('Geolocalização indisponível neste navegador.', true);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentOrigin = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          hasRouteOrigin = true;
          originDescription =
            '<strong>Sua partida</strong><br>Localização atual do dispositivo (GPS).';
          map.setView([currentOrigin.lat, currentOrigin.lng], 14);
          setStatus('Localização aplicada.');
          calcularRota();
        },
        () => {
          setStatus('Permissão negada ou erro de GPS. Usando centro de Crato.', true);
          currentOrigin = { ...DEFAULT_ORIGIN };
          hasRouteOrigin = false;
          originDescription =
            '<strong>Sua partida</strong><br>Centro estimado em Crato–CE (GPS indisponível).';
          showAllEcopontos('GPS indisponível. Informe seu CEP para traçar a rota; por enquanto mostramos todos os ecopontos.');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    }

    async function aplicarCep(options = {}) {
      const input = cfg.cepInputId ? $(cfg.cepInputId) : null;
      const btn = cfg.cepBtnId ? $(cfg.cepBtnId) : null;
      if (!input) return;

      const cep8 = cepDigitsOnly(input.value);
      if (!cep8) {
        setStatus('Digite um CEP válido com 8 dígitos.', true);
        return;
      }

      const prevLabel = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Buscando…';
      }

      setStatus('Consultando CEP e localizando no mapa…');

      try {
        const via = await fetchViaCep(cep8);
        const geo = await geocodeAddressFromViaCep(via, cep8);

        if (!geo) {
          throw new Error(
            'Não foi possível localizar esse CEP no mapa. Tente o GPS ou outro CEP.'
          );
        }

        currentOrigin = { lat: geo.lat, lng: geo.lng };
        hasRouteOrigin = true;
        const cepFmt = formatCep(cep8);
        originDescription = `<strong>Partida pelo CEP</strong><br>${cepFmt} · ${via.localidade}/${via.uf}`;
        try {
          localStorage.setItem('userCep', cepFmt);
        } catch (eStorage) {
          /* ignore */
        }

        map.setView([currentOrigin.lat, currentOrigin.lng], 14);
        await calcularRota();
      } catch (e) {
        console.error(e);
        setStatus(e.message || 'Erro ao usar o CEP.', true);
        if (options.fallbackToDefault) {
          currentOrigin = { ...DEFAULT_ORIGIN };
          hasRouteOrigin = false;
          originDescription =
            '<strong>Sua partida</strong><br>Centro estimado em Crato–CE (CEP do perfil indisponível).';
          showAllEcopontos('Não foi possível usar o CEP salvo no perfil. Informe um CEP válido para traçar a rota; por enquanto mostramos todos os ecopontos.');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = prevLabel || 'Usar este CEP';
        }
      }
    }

    function bindUi() {
      const sel = $(cfg.selectId);
      if (sel) sel.addEventListener('change', () => calcularRota());

      if (cfg.recalcBtnId) {
        const b = $(cfg.recalcBtnId);
        if (b) b.addEventListener('click', () => calcularRota());
      }

      if (cfg.locateBtnId) {
        const b = $(cfg.locateBtnId);
        if (b) b.addEventListener('click', () => usarMinhaLocalizacao());
      }

      if (cfg.cepInputId) {
        const inp = $(cfg.cepInputId);
        if (inp) {
          inp.addEventListener('input', () => {
            const d = inp.value.replace(/\D/g, '').slice(0, 8);
            inp.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
          });
          inp.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              aplicarCep();
            }
          });
        }
      }

      if (cfg.cepBtnId) {
        const b = $(cfg.cepBtnId);
        if (b) b.addEventListener('click', () => aplicarCep());
      }
    }

    function invalidateSize() {
      if (map) map.invalidateSize();
    }

    return {
      init() {
        initMap();
        setStatus('Carregando ecopontos da região do Cariri…');
        fetchOsmEcopontos()
          .then((points) => {
            if (Array.isArray(points) && points.length) {
              ECOPONTOS = points;
            }
          })
          .catch(() => {
            ECOPONTOS = FALLBACK_ECOPONTOS.slice();
          })
          .finally(() => {
            fillSelect();
            publishEcopontos();
            bindUi();
            const storedCep = getStoredUserCep();
            const cepInput = cfg.cepInputId ? $(cfg.cepInputId) : null;
            if (storedCep && cepInput) {
              cepInput.value = formatCep(storedCep);
              aplicarCep({ fallbackToDefault: true });
            } else {
              showAllEcopontos();
            }
          });
        invalidateSize();
        window.addEventListener('load', invalidateSize);
      },
      invalidateSize,
    };
  }

  function findEcopontoInCatalog(name) {
    const norm = normalizeId(name);
    if (!norm) return null;
    const exact = ECOPONTOS.find((p) => normalizeId(p.name) === norm);
    if (exact) return exact;
    return (
      ECOPONTOS.find((p) => {
        const pn = normalizeId(p.name);
        return pn.includes(norm) || norm.includes(pn);
      }) || null
    );
  }

  /**
   * Resolve coordenadas do ecoponto do admin (catálogo, geocode ou demo SP).
   * @param {{ name?: string, address?: string, lat?: number, lng?: number }} info
   */
  async function resolveEcopontoLocation(info) {
    const name = String(info?.name || '').trim() || 'EcoPonto';
    const address = String(info?.address || '').trim();
    const lat = info?.lat;
    const lng = info?.lng;

    if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { name, address, lat, lng };
    }

    const found = findEcopontoInCatalog(name);
    if (found) {
      return {
        name: found.name,
        address: address || found.address || found.city || '',
        lat: found.lat,
        lng: found.lng,
      };
    }

    const queries = [];
    if (address) queries.push(`${address}, Brasil`);
    if (name && name !== 'EcoPonto') queries.push(`${name}, Brasil`);

    for (let i = 0; i < queries.length; i++) {
      const geo = await nominatimGeocodeQuery(queries[i]);
      if (geo) {
        return { name, address: address || queries[i], lat: geo.lat, lng: geo.lng };
      }
    }

    return {
      name,
      address: address || 'São Paulo, SP',
      lat: DEFAULT_SAOPAULO_ECOPONTO.lat,
      lng: DEFAULT_SAOPAULO_ECOPONTO.lng,
    };
  }

  /**
   * Mapa ADM: ecoponto fixo como origem; busca de destino e rota OSRM.
   * @param {object} cfg
   * @param {string} cfg.mapElId
   * @param {string} cfg.searchInputId
   * @param {string} [cfg.searchBtnId]
   * @param {string} [cfg.routeBtnId]
   * @param {string} [cfg.statusId]
   * @param {boolean} [cfg.autoRouteOnSearch] traça rota OSRM após busca bem-sucedida
   */
  function createEcopontoAdminMap(cfg) {
    let map = null;
    let routeLayer = null;
    let markersLayer = null;
    let ecopontoOrigin = {
      name: 'EcoPonto',
      address: '',
      lat: DEFAULT_SAOPAULO_ECOPONTO.lat,
      lng: DEFAULT_SAOPAULO_ECOPONTO.lng,
    };
    let lastDestination = null;
    let lastDestinationLabel = '';

    function setStatus(msg, isError) {
      const el = cfg.statusId ? $(cfg.statusId) : null;
      if (!el) return;
      el.textContent = msg || '';
      el.classList.toggle('is-error', !!isError);
    }

    function initMap() {
      map = L.map(cfg.mapElId, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([ecopontoOrigin.lat, ecopontoOrigin.lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      routeLayer = L.layerGroup().addTo(map);
      markersLayer = L.layerGroup().addTo(map);
    }

    function showEcopontoOnly(statusMessage) {
      if (!map) return;
      routeLayer.clearLayers();
      markersLayer.clearLayers();

      L.marker([ecopontoOrigin.lat, ecopontoOrigin.lng], { icon: ecopontoIcon })
        .addTo(markersLayer)
        .bindTooltip(ecopontoOrigin.name, {
          direction: 'top',
          offset: [0, -8],
          opacity: 1,
          className: 'eco-marker-tooltip',
        })
        .bindPopup(
          `<strong>${ecopontoOrigin.name}</strong><br>${ecopontoOrigin.address || 'Seu EcoPonto'}`
        );

      map.setView([ecopontoOrigin.lat, ecopontoOrigin.lng], 16);
      if (statusMessage) setStatus(statusMessage);
    }

    function drawRouteFromEcoponto(latlngs, dest, destLabel) {
      routeLayer.clearLayers();
      markersLayer.clearLayers();

      if (!latlngs.length) return;

      const line = L.polyline(latlngs, {
        color: '#0f6b3a',
        weight: 6,
        opacity: 0.92,
        lineJoin: 'round',
        lineCap: 'round',
      });
      line.addTo(routeLayer);

      L.polyline(latlngs, {
        color: '#8fffc7',
        weight: 2,
        opacity: 1,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(routeLayer);

      L.marker([ecopontoOrigin.lat, ecopontoOrigin.lng], { icon: ecopontoIcon })
        .addTo(markersLayer)
        .bindPopup(
          `<strong>${ecopontoOrigin.name}</strong><br>${ecopontoOrigin.address || 'Origem — seu EcoPonto'}`
        );

      L.circleMarker([dest.lat, dest.lng], {
        radius: 10,
        color: '#0f2c21',
        fillColor: '#e53935',
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(markersLayer)
        .bindPopup(`<strong>Destino</strong><br>${destLabel || 'Endereço buscado'}`);

      const bounds = line
        .getBounds()
        .extend([ecopontoOrigin.lat, ecopontoOrigin.lng])
        .extend([dest.lat, dest.lng]);
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 });
    }

    function previewDestination(geo, label) {
      lastDestination = { lat: geo.lat, lng: geo.lng };
      lastDestinationLabel = label;

      markersLayer.clearLayers();
      routeLayer.clearLayers();

      L.marker([ecopontoOrigin.lat, ecopontoOrigin.lng], { icon: ecopontoIcon })
        .addTo(markersLayer)
        .bindPopup(`<strong>${ecopontoOrigin.name}</strong><br>Origem`);

      L.circleMarker([geo.lat, geo.lng], {
        radius: 10,
        color: '#0f2c21',
        fillColor: '#e53935',
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(markersLayer)
        .bindPopup(`<strong>Destino</strong><br>${label}`);

      map.fitBounds(
        [
          [ecopontoOrigin.lat, ecopontoOrigin.lng],
          [geo.lat, geo.lng],
        ],
        { padding: [48, 48], maxZoom: 16 }
      );
    }

    async function buscarDestino(options) {
      const input = cfg.searchInputId ? $(cfg.searchInputId) : null;
      const q = input ? String(input.value || '').trim() : '';
      if (!q) {
        setStatus('Digite uma rua, bairro ou endereço de destino.', true);
        return null;
      }

      const btn = cfg.searchBtnId ? $(cfg.searchBtnId) : null;
      const prevLabel = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Buscando…';
      }

      setStatus('Localizando destino no mapa…');

      try {
        let geo = await nominatimGeocodeQuery(`${q}, Brasil`);
        if (!geo) {
          geo = await nominatimGeocodeQuery(q);
        }
        if (!geo) {
          throw new Error('Endereço não encontrado. Tente incluir bairro ou cidade.');
        }

        previewDestination(geo, q);
        if (options && options.traceRoute) {
          setStatus('Destino localizado. Calculando rota…');
          await calcularRotaParaDestino();
        } else {
          setStatus('Destino localizado. Clique em “Traçar rota” para ver o caminho.');
        }
        return lastDestination;
      } catch (e) {
        console.error(e);
        setStatus(e.message || 'Erro ao buscar endereço.', true);
        return null;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = prevLabel || 'Buscar';
        }
      }
    }

    async function buscarDestinoPorCep(options) {
      const input = cfg.cepInputId ? $(cfg.cepInputId) : null;
      const cep8 = input ? cepDigitsOnly(input.value) : null;
      if (!cep8) {
        setStatus('Digite um CEP válido com 8 dígitos.', true);
        return null;
      }

      const btn = cfg.cepBtnId ? $(cfg.cepBtnId) : null;
      const prevLabel = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Buscando…';
      }

      setStatus('Consultando CEP e localizando destino…');

      try {
        const via = await fetchViaCep(cep8);
        const geo = await geocodeAddressFromViaCep(via, cep8);
        if (!geo) {
          throw new Error(
            'Não foi possível localizar esse CEP no mapa. Tente outro CEP ou busque pela rua.'
          );
        }

        const cepFmt = formatCep(cep8);
        const addrParts = [cepFmt];
        if (via.logradouro) addrParts.push(via.logradouro);
        if (via.bairro) addrParts.push(via.bairro);
        addrParts.push(`${via.localidade}/${via.uf}`);
        const label = addrParts.join(' · ');

        previewDestination(geo, label);
        setStatus('CEP localizado. Clique em “Traçar rota” para ver o caminho.');
        if (options && options.traceRoute) {
          await calcularRotaParaDestino();
        }
        return lastDestination;
      } catch (e) {
        console.error(e);
        setStatus(e.message || 'Erro ao buscar CEP.', true);
        return null;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = prevLabel || 'Buscar CEP';
        }
      }
    }

    async function calcularRotaParaDestino() {
      if (!lastDestination) {
        const cepInput = cfg.cepInputId ? $(cfg.cepInputId) : null;
        const hasCep = cepInput && cepDigitsOnly(cepInput.value);
        const found = hasCep
          ? await buscarDestinoPorCep({ traceRoute: false })
          : await buscarDestino({ traceRoute: false });
        if (!found) return;
      }

      setStatus('Calculando rota a partir do seu EcoPonto…');

      try {
        const [footRoute, carRoute] = await Promise.all([
          fetchOsrmRoute('foot', ecopontoOrigin, lastDestination),
          fetchOsrmRoute('car', ecopontoOrigin, lastDestination),
        ]);

        const latlngs = geometryToLatLngs(carRoute.geometry);
        drawRouteFromEcoponto(latlngs, lastDestination, lastDestinationLabel);

        setStatus(
          `Rota do EcoPonto até o destino · Carro: ${formatDistance(carRoute.distance)} (${formatDuration(carRoute.duration)}) · A pé: ${formatDistance(footRoute.distance)} (${formatDuration(footRoute.duration)})`
        );
      } catch (e) {
        console.error(e);
        routeLayer.clearLayers();
        showEcopontoOnly();
        setStatus(e.message || 'Não foi possível traçar a rota. Tente outro endereço.', true);
      }
    }

    function bindUi() {
      const searchOpts = cfg.autoRouteOnSearch ? { traceRoute: true } : { traceRoute: false };

      if (cfg.searchBtnId) {
        const b = $(cfg.searchBtnId);
        if (b) b.addEventListener('click', () => buscarDestino(searchOpts));
      }

      if (cfg.cepBtnId) {
        const b = $(cfg.cepBtnId);
        if (b) b.addEventListener('click', () => buscarDestinoPorCep({ traceRoute: false }));
      }

      if (cfg.routeBtnId) {
        const b = $(cfg.routeBtnId);
        if (b) b.addEventListener('click', () => calcularRotaParaDestino());
      }

      if (cfg.cepInputId) {
        const inp = $(cfg.cepInputId);
        if (inp) {
          inp.addEventListener('input', () => {
            const d = inp.value.replace(/\D/g, '').slice(0, 8);
            inp.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
          });
          inp.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              buscarDestinoPorCep({ traceRoute: false });
            }
          });
        }
      }

      if (cfg.searchInputId) {
        const inp = $(cfg.searchInputId);
        if (inp) {
          inp.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              buscarDestino(searchOpts);
            }
          });
        }
      }
    }

    function invalidateSize() {
      if (map) map.invalidateSize();
    }

    return {
      init(initialInfo) {
        initMap();
        bindUi();
        const info =
          initialInfo ||
          (typeof cfg.getEcopontoInfo === 'function' ? cfg.getEcopontoInfo() : null) ||
          {};
        return resolveEcopontoLocation(info)
          .then((loc) => {
            ecopontoOrigin = loc;
            showEcopontoOnly();
          })
          .catch((e) => {
            console.error(e);
            showEcopontoOnly();
          })
          .finally(() => {
            invalidateSize();
            window.addEventListener('load', invalidateSize);
          });
      },
      setEcoponto(info) {
        return resolveEcopontoLocation(info || {})
          .then((loc) => {
            ecopontoOrigin = loc;
            lastDestination = null;
            lastDestinationLabel = '';
            showEcopontoOnly();
          })
          .catch((e) => {
            console.error(e);
            setStatus('Não foi possível atualizar o EcoPonto no mapa.', true);
          });
      },
      invalidateSize,
    };
  }

  window.EcoColetaMapa = {
    createRouteWidget,
    createEcopontoAdminMap,
    resolveEcopontoLocation,
    findEcopontoInCatalog,
  };

  document.addEventListener('DOMContentLoaded', () => {
    if ($('map') && $('ecoponto-select')) {
      createRouteWidget({
        mapElId: 'map',
        selectId: 'ecoponto-select',
        locateBtnId: 'btn-local',
        recalcBtnId: 'btn-calcular',
        statusId: 'mapa-status',
        timesPanelId: 'times-panel',
        cepInputId: 'cep-origem',
        cepBtnId: 'btn-cep',
      }).init();
    }

    if ($('adm-map')) {
      const widget = createEcopontoAdminMap({
        mapElId: 'adm-map',
        searchInputId: 'adm-map-search-input',
        searchBtnId: 'adm-map-search-btn',
        statusId: 'adm-map-search-status',
        autoRouteOnSearch: true,
        getEcopontoInfo() {
          const nameEl = document.getElementById('ecopontoDetailName');
          const addrEl = document.getElementById('ecopontoDetailAddress');
          return {
            name: nameEl ? nameEl.textContent.trim() : '',
            address: addrEl ? addrEl.textContent.trim() : '',
          };
        },
      });
      widget.init();
      window.EcoColetaAdmMap = widget;
    }
  });
})();
