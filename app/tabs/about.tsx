import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMarkers } from '@/components/MarkersContext';

type Suggestion = { name: string; placeId: string };

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function PlaceCard({
  name,
  subtitle,
  onPress,
}: {
  name: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardIconWrap}>
        <View style={styles.cardIconBubble}>
          <Ionicons name="location" size={20} color="rgba(255,255,255,0.92)" />
        </View>
      </View>

      <Text numberOfLines={2} style={styles.cardTitle}>
        {name}
      </Text>
      <Text numberOfLines={1} style={styles.cardSubtitle}>
        {subtitle}
      </Text>

      <View style={styles.cardAccent} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const [linkUrl, setLinkUrl] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [sessionToken, setSessionToken] = useState('');

  const { markers, addMarker } = useMarkers();

  const proxyBase = useMemo(() => process.env.EXPO_PUBLIC_PLACES_PROXY_URL?.trim() ?? '', []);

  // health check
  useEffect(() => {
    if (!proxyBase) {
      setProxyStatus('error');
      return;
    }
    const normalized = proxyBase.replace(/\/$/, '');
    fetch(`${normalized}/api/health`)
      .then((response) => setProxyStatus(response.ok ? 'ok' : 'error'))
      .catch(() => setProxyStatus('error'));
  }, [proxyBase]);

  // autocomplete
  useEffect(() => {
    const trimmedQuery = placeQuery.trim();
    if (!proxyBase || trimmedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const normalized = proxyBase.replace(/\/$/, '');
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const token = sessionToken || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        if (!sessionToken) setSessionToken(token);

        const url = `${normalized}/api/places?query=${encodeURIComponent(trimmedQuery)}&sessionToken=${encodeURIComponent(
          token
        )}`;

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (data.status !== 'OK' || !data.predictions?.length) {
          setSuggestions([]);
          return;
        }

        setSuggestions(
          data.predictions.slice(0, 6).map((r: any) => ({
            name: r.description,
            placeId: r.place_id,
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 650);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [placeQuery, proxyBase, sessionToken]);

  const handleSuggestionPress = async (placeId: string, label: string) => {
    if (!proxyBase) {
      Alert.alert('Missing proxy', 'Set EXPO_PUBLIC_PLACES_PROXY_URL to use the Places proxy.');
      return;
    }

    const normalized = proxyBase.replace(/\/$/, '');
    try {
      const tokenParam = sessionToken ? `&sessionToken=${encodeURIComponent(sessionToken)}` : '';
      const url = `${normalized}/api/place-details?placeId=${encodeURIComponent(placeId)}${tokenParam}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result?.geometry?.location) {
        Alert.alert('No results', data.error_message || 'No matching places found.');
        return;
      }

      const loc = data.result.geometry.location;

      setPlaceQuery(label);
      setSuggestions([]);
      setSessionToken('');

      // IMPORTANT: use "label" (not stale placeQuery)
      addMarker(loc.lat, loc.lng, label);

      router.push({
        pathname: '/tabs',
        params: { lat: loc.lat.toString(), lng: loc.lng.toString() },
      });
    } catch {
      Alert.alert('Search failed', 'Unable to reach Google Places right now.');
    }
  };

  const handlePlaceSearch = async () => {
    const q = placeQuery.trim();
    if (!q) {
      Alert.alert('Missing place', 'Enter a place name to search.');
      return;
    }

    // If we already have suggestions, take the first one.
    if (suggestions.length > 0) {
      handleSuggestionPress(suggestions[0].placeId, suggestions[0].name);
      return;
    }

    if (!proxyBase) {
      Alert.alert('Missing proxy', 'Set EXPO_PUBLIC_PLACES_PROXY_URL to use the Places proxy.');
      return;
    }

    // Otherwise fetch autocomplete and take first result.
    const normalized = proxyBase.replace(/\/$/, '');
    try {
      const response = await fetch(`${normalized}/api/places?query=${encodeURIComponent(q)}`);
      const data = await response.json();

      const first = data?.predictions?.[0];
      if (data.status !== 'OK' || !first?.place_id) {
        Alert.alert('No results', data.error_message || 'No matching places found.');
        return;
      }

      handleSuggestionPress(first.place_id, first.description || q);
    } catch {
      Alert.alert('Search failed', 'Unable to reach Google Places right now.');
    }
  };

  const handleLinkSubmit = async () => {
    const url = linkUrl.trim();
    if (!url) {
      Alert.alert('Missing link', 'Paste a TikTok or Instagram link.');
      return;
    }
    if (!proxyBase) {
      Alert.alert('Missing proxy', 'Set EXPO_PUBLIC_PLACES_PROXY_URL to use the server.');
      return;
    }

    try {
      const response = await fetch(`${proxyBase.replace(/\/$/, '')}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Submit failed', data?.error || 'Unable to submit the link.');
        return;
      }
      Alert.alert('Link submitted', 'We received the link and will process it.');
      setLinkUrl('');
    } catch {
      Alert.alert('Submit failed', 'Unable to reach the server.');
    }
  };

  const sortedMarkers = [...markers].reverse(); // newest first (works even if no createdAt)

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedMarkers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 140, // keep content above the pill tab bar
          paddingHorizontal: 18,
        }}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const title = item.name?.trim() || 'Saved place';
          const subtitle = formatCoords(item.latitude, item.longitude);

          return (
            <PlaceCard
              name={title}
              subtitle={subtitle}
              onPress={() =>
                router.push({
                  pathname: '/tabs',
                  params: { lat: item.latitude.toString(), lng: item.longitude.toString() },
                })
              }
            />
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Saved Locations</Text>
            <Text style={styles.headerSubtitle}>
              Tap a card to jump to it on the map. Proxy: {proxyStatus === 'checking' ? 'checking…' : proxyStatus}
            </Text>
            <View style={styles.headerDivider} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved places yet</Text>
            <Text style={styles.emptySubtitle}>Add one below and it’ll appear here.</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Add Location</Text>

            <Text style={styles.label}>TikTok/Instagram link</Text>
            <TextInput
              style={styles.input}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="https://www.tiktok.com/@user/video/..."
              placeholderTextColor="#9aa0a6"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable style={styles.button} onPress={handleLinkSubmit}>
              <Text style={styles.buttonText}>Send Link</Text>
            </Pressable>

            <Text style={styles.orDivider}>Or search by place name</Text>

            <Text style={styles.label}>Place name</Text>
            <TextInput
              style={styles.input}
              value={placeQuery}
              onChangeText={setPlaceQuery}
              placeholder="e.g. Pizza Hut Toronto"
              placeholderTextColor="#9aa0a6"
              autoCapitalize="none"
            />

            {isSuggesting ? (
              <Text style={styles.suggestingText}>Searching…</Text>
            ) : suggestions.length > 0 ? (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s.placeId}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(s.placeId, s.name)}
                  >
                    <Text style={styles.suggestionTitle}>{s.name}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.button} onPress={handlePlaceSearch}>
              <Text style={styles.buttonText}>Search Place</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },

  header: {
    marginBottom: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.62)',
    marginTop: 6,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginTop: 14,
  },

  row: {
    gap: 14,
    marginBottom: 14,
  },

  card: {
    flex: 1,
    backgroundColor: '#2b3036',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    minHeight: 120,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  cardIconWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.60)',
    marginTop: 6,
    fontSize: 12,
  },
  cardAccent: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#ffd33d',
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },

  empty: {
    backgroundColor: '#1f2328',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginTop: 8,
    marginBottom: 6,
  },
  emptyTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.62)',
    marginTop: 6,
  },

  footer: {
    marginTop: 14, // <-- pushes the add form lower (as you asked)
    paddingTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  label: {
    color: '#fff',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1f2328',
    borderColor: '#3a3f45',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestingText: {
    color: '#b3b8bf',
    marginTop: 8,
  },
  suggestions: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3f45',
    backgroundColor: '#171a1f',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f35',
  },
  suggestionTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    marginTop: 14,
    backgroundColor: '#ffd33d',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  orDivider: {
    color: '#b3b8bf',
    marginTop: 16,
  },
  buttonText: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
});
