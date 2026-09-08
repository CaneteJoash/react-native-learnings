export type PlatformLike = {
  OS: 'ios' | 'android' | string;
  Version: number | string;
};

export function supportsFeatureX(platform: PlatformLike): boolean {
  if (platform.OS === 'android') return (platform.Version as number) >= 31;
  if (platform.OS === 'ios') return parseInt(platform.Version as string, 10) >= 15;
  return false;
}
