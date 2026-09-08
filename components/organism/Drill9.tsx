import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { styles } from '@/constants/styles';
import { GALLERY_PHOTOS, type GalleryPhoto } from '@/lib/gallery-photos';
import { ThemedText } from '../themed-text';

const GRID_GAP = 8;
const ITEM_WIDTH = 150;

type CacheMap = Record<string, string>;

const densityAsset = require('@/assets/images/density-check.png');

function GalleryItem({ photo }: { photo: GalleryPhoto }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const reservedHeight = ITEM_WIDTH * (photo.height / photo.width);

  return (
    <View style={[gridStyles.item, { width: ITEM_WIDTH, height: reservedHeight }]}>
      <Image
        source={status === 'error' ? require('@/assets/images/placeholder.png') : { uri: photo.uri }}
        resizeMode="cover"
        style={{ width: ITEM_WIDTH, height: reservedHeight }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </View>
  );
}

function CircularAvatar() {
  const size = 64;
  return (
    <Image
      source={require('@/assets/images/motor.jpg')}
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

function AsymmetricRadiusSwatch() {
  return (
    <Image
      source={require('@/assets/images/motor.jpg')}
      resizeMode="cover"
      style={{
        width: 64,
        height: 64,
        borderTopLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}
    />
  );
}

export default function Drill9() {
  const [cacheBefore, setCacheBefore] = useState<CacheMap>({});
  const [cacheAfter, setCacheAfter] = useState<CacheMap>({});
  const [densityInfo] = useState(() => {
    const resolved = Image.resolveAssetSource(densityAsset);
    return { uri: resolved.uri, scale: resolved.scale };
  });

  useEffect(() => {
    const urls = GALLERY_PHOTOS.map((p) => p.uri);
    if (!Image.queryCache) return;
    const queryCache = Image.queryCache;

    (async () => {
      const before = await queryCache(urls);
      console.log('[Drill9] cache before prefetch:', before);
      setCacheBefore(before);
      const uncached = urls.filter((url) => !before[url]);
      await Promise.all(uncached.map((url) => Image.prefetch(url).catch(() => false)));

      const after = await queryCache(urls);
      console.log('[Drill9] cache after prefetch:', after);
      setCacheAfter(after);
    })();
  }, []);

  return (
    <View>
      <ThemedText style={styles.drillTitle}>Drill 9 — The gallery that never shifts</ThemedText>

      <ThemedText type="subtitle">Density suffix — which file loaded</ThemedText>
      <ThemedText>
        Same require() for check.png / check@2x.png / check@3x.png — the bundler picks by device
        scale. Color + label baked into each file so you can eyeball it too.
      </ThemedText>
      <Image source={densityAsset} />
      {densityInfo && (
        <ThemedText>
          resolveAssetSource → scale {densityInfo.scale}x, uri &quot;{densityInfo.uri}&quot;
        </ThemedText>
      )}

      <ThemedText type="subtitle" style={gridStyles.section}>
        Avatar — circular frame, resizeMode=&quot;cover&quot;
      </ThemedText>
      <View style={gridStyles.row}>
        <CircularAvatar />
        <View style={{ width: 16 }} />
        <View>
          <AsymmetricRadiusSwatch />
          <ThemedText>per-corner radii ↑</ThemedText>
        </View>
      </View>
      <ThemedText>
        Symmetric borderRadius (fully circular) has been reliable on both platforms in testing.
        The asymmetric swatch above (top-left + bottom-right only) is the one the docs warn about —
        verify it on an actual iOS and Android device/simulator, since this table entry is exactly
        the kind of thing that drifts across RN versions. Note what you see here once you&apos;ve
        checked: ___
      </ThemedText>

      <ThemedText type="subtitle" style={gridStyles.section}>
        Gallery grid — zero layout shift
      </ThemedText>
      <View style={gridStyles.grid}>
        {GALLERY_PHOTOS.map((photo) => (
          <GalleryItem key={photo.id} photo={photo} />
        ))}
      </View>

      <ThemedText type="subtitle" style={gridStyles.section}>
        Cache map — before / after prefetch
      </ThemedText>
      <ThemedText>Before: {JSON.stringify(cacheBefore)}</ThemedText>
      <ThemedText>After: {JSON.stringify(cacheAfter)}</ThemedText>
    </View>
  );
}

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  section: {
    marginTop: 20,
  },
});
