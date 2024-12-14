import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThirdDimension as Transformations3d } from 'screens/third-dimension';

export type RootStackParamList = {
  SinWave: undefined;
  Overview: undefined;
  ThirdDimension: undefined;
  Transformations: undefined;
  Details: { name: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ThirdDimension">
        <Stack.Screen
          name="ThirdDimension"
          component={Transformations3d}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
