import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootStack from './navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootStack />
    </GestureHandlerRootView>
  );
}
