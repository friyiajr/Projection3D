import Slider from '@react-native-community/slider';
import {
  Canvas,
  Circle,
  LinearGradient,
  Path,
  Shadow,
  usePathValue,
  vec,
} from '@shopify/react-native-skia';
import React from 'react';
import { Dimensions, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('screen');

interface Coord2d {
  x: number;
  y: number;
}

interface Coord3d extends Coord2d {
  z: number;
}

const faceCoords: Coord3d[][] = [
  [
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
  ],
  [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
  ],
  [
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
  ],
  [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
  ],
];

const projectMatrix2D = (coords: Coord3d) => {
  'worklet';

  const zDist = 10;

  const fov = Math.PI / 6.0;
  const f = 1 / Math.tan(fov / 2);
  const ar = width / width;

  const far = zDist * 5.0;
  const near = zDist / 5.0;

  const v4 = {
    x: coords.x,
    y: coords.y,
    z: coords.z,
    w: 1,
  };

  const pm: number[][] = [
    [f * ar, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, far / far - near, -(far * near) / far - near],
    [0, 0, 1, 0],
  ];

  const result = {
    x: v4.x * pm[0][0] + v4.y * pm[0][1] + v4.z * pm[0][2] + v4.w * pm[0][3],
    y: v4.x * pm[1][0] + v4.y * pm[1][1] + v4.z * pm[1][2] + v4.w * pm[1][3],
    z: v4.x * pm[2][0] + v4.y * pm[2][1] + v4.z * pm[2][2] + v4.w * pm[2][3],
    w: v4.x * pm[3][0] + v4.y * pm[3][1] + v4.z * pm[3][2] + v4.w * pm[3][3],
  };

  const tempX = result.x / result.w;
  const tempY = result.y / result.w;

  return {
    x: ((tempX + 1) / 2) * width,
    y: (1 - (tempY + 1) / 2) * width,
  };
};

const rotate3D = ({ x, y, z }: Coord3d, roll: number, pitch: number, yaw: number) => {
  'worklet';

  const cy = Math.cos(yaw);
  const cp = Math.cos(pitch);
  const cr = Math.cos(roll);

  const sy = Math.sin(yaw);
  const sp = Math.sin(pitch);
  const sr = Math.sin(roll);

  return {
    x: cy * cp * x + (cy * sp * sr - sy * cr) * y + (cy * sp * cr + sy * sr) * z,
    y: sy * cp * x + (sy * sp * sr + cy * cr) * y + (sy * sp * cr - cy * sr) * z,
    z: -sp * x + cp * sr * y + cp * cr * z,
  };
};

export const ThirdDimension = () => {
  const rollVal = useSharedValue(0);
  const pitchVal = useSharedValue(0);

  const path = usePathValue((newPath) => {
    'worklet';

    const rollRotation = (-rollVal.value / width) * Math.PI;
    const pitchRotation = (-pitchVal.value / width) * Math.PI;

    for (const faceCoordArray of faceCoords) {
      for (const [index, faceCoords] of faceCoordArray.entries()) {
        const rotatedPoint = rotate3D(faceCoords, pitchRotation, rollRotation, 0);
        const newCoords = projectMatrix2D({ ...rotatedPoint, z: rotatedPoint.z + 5 });
        if (index === 0) {
          newPath.moveTo(newCoords.x, newCoords.y);
        } else {
          newPath.lineTo(newCoords.x, newCoords.y);
        }
      }
      newPath.close();
    }

    return newPath;
  });

  return (
    <View style={$containerStyle}>
      <Canvas style={$canvasStyle}>
        <Path path={path} style="stroke" color={TERMINAL_GREEN} strokeWidth={LINE_WIDTH} />
      </Canvas>

      <View style={$sliderContainer}>
        <Text style={$sliderText}>ROLL: </Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={TERMINAL_GREEN}
          maximumTrackTintColor="#000000"
          thumbTintColor="#FFFFFF"
          onValueChange={(val) => {
            rollVal.value = val * 500;
          }}
        />
      </View>
      <View style={$sliderContainer}>
        <Text style={$sliderText}>PITCH: </Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={TERMINAL_GREEN}
          maximumTrackTintColor="#000000"
          thumbTintColor="#FFFFFF"
          onValueChange={(val) => {
            pitchVal.value = val * 500;
          }}
        />
      </View>
    </View>
  );
};

const LINE_WIDTH = 3;
const TERMINAL_GREEN = '#4ee44e';
const SHADOW_GREEN = '#b4f4b4';

const $containerStyle: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  backgroundColor: 'black',
};

const $canvasStyle: ViewStyle = {
  width,
  height: width,
};

const $sliderContainer: ViewStyle = {
  paddingTop: 20,
  flexDirection: 'row',
  alignItems: 'center',
};

const $sliderText: TextStyle = {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 20,
};
