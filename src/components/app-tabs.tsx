import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { StitchCupertinoHome } from '@/constants/stitch-cupertino-home';
import { appStrings } from '@/strings';
import { shouldForceOpaqueNativeTabBarOnIos } from '@/utils/ios';

export default function AppTabs() {
  const opaqueTabBarFill = shouldForceOpaqueNativeTabBarOnIos();

  return (
    <NativeTabs
      backgroundColor={StitchCupertinoHome.canvas}
      indicatorColor={StitchCupertinoHome.surfaceLow}
      labelStyle={{ selected: { color: StitchCupertinoHome.onSurface } }}
      disableTransparentOnScrollEdge={opaqueTabBarFill}
      blurEffect={opaqueTabBarFill ? 'none' : undefined}>
      <NativeTabs.Trigger name="onboarding">
        <NativeTabs.Trigger.Label>{appStrings.tabs.start}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person_add"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{appStrings.tabs.home}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="capuch">
        <NativeTabs.Trigger.Label>{appStrings.tabs.capuch}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'pawprint', selected: 'pawprint.fill' }}
          md="pets"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{appStrings.tabs.settings}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
