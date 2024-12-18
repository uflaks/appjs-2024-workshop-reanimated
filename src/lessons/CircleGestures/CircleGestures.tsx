import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";

export function CircleGesturesLesson() {
  const x = useSharedValue(0);
  const isInteracting = useSharedValue(false);
  const scale = useDerivedValue(() => {
    return withSpring(isInteracting.value ? 2 : 1);
  })

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isInteracting.value = true;
    })
    .onChange((ev) => {
      x.value += ev.changeX
    })
    .onEnd(() => {
      x.value = withSpring(0)
    })
    .onFinalize(() => {
      isInteracting.value = false
    })

  // @ts-ignore
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        scale.value,
        [1, 2],
        [layout.knobSize / 2, 2],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateX: x.value,
        },
        {
          scale: scale.value
        }
      ]
    }
  });


  return (
    <GestureDetector gesture={panGesture}>
      <Container>
        <Animated.View style={{ flex: 1, justifyContent: "center" }}>
          <Animated.View style={[styles.knob, animatedStyle]} hitSlop={hitSlop} />
        </Animated.View>
      </Container>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  knob: {
    width: layout.knobSize,
    height: layout.knobSize,
    borderRadius: layout.knobSize / 2,
    backgroundColor: "#fff",
    borderWidth: layout.knobSize / 2,
    borderColor: colorShades.purple.base,
    position: "absolute",
    left: -layout.knobSize / 2,
  },
});
