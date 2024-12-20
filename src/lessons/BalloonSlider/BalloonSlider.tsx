import { AnimatedText } from "@/components/AnimatedText";
import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SensorType,
  clamp,
  defineAnimation,
  interpolate,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";



export function BalloonSliderLesson() {
  const x = useSharedValue(0);
  const knobScale = useSharedValue(0);
  const balloonScale = useSharedValue(0);
  const scale = useSharedValue(0);
  const aRef = useAnimatedRef<View>();
  const isTouching = useSharedValue(false);

  const progress = useDerivedValue(() => {
    return x.value / measure(aRef)?.width * 100 || 0
  });

  const balloonSpringyX = useDerivedValue(() => {
    return withSpring(x.value);
  });

  const tapGesture = Gesture.Tap()
    .maxDuration(100000)
    .onBegin(() => {
      scale.value = withSpring(2);
      balloonScale.value = withSpring(1);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      balloonScale.value = withSpring(0);
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      isTouching.value = true;
    })
    .onStart(() => {
      knobScale.value = withSpring(1);
    })
    .onChange((ev) => {
      const size = measure(aRef);
      x.value = clamp((x.value += ev.changeX), 0, size.width);
    })
    .onEnd(() => {
      knobScale.value = withSpring(0);
    })
    .onFinalize(() => {
      balloonScale.value = 0;
      isTouching.value = false;
    })

  const gestures = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        knobScale.value,
        [0, 1],
        [layout.knobSize / 2, 2],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: x.value,
        },
        {
          scale: knobScale.value + 1,
        },
      ],
    };
  });

  const balloonStyle = useAnimatedStyle(() => {
    return {
      opacity: balloonScale.value,
      transform: [
        { translateX: balloonSpringyX.value },
        { scale: balloonScale.value },
        { translateY: interpolate(
            balloonScale.value,
            [0, 1],
            [0, -layout.indicatorSize]
          ),
        },
        {
          rotate: `${Math.atan2(
            balloonSpringyX.value - x.value,
            layout.indicatorSize * 2
          )}rad`,
        }
      ],
    };
  });

  function withGravity(userConfig) {
    "worklet";
    return defineAnimation(0, () => {
      "worklet";
      const config = {
        acceleration: 9.81,
        velocity: 0,
      };
      Object.assign(config, userConfig);
      return {
        onStart: (animation, value, now, previousAnimation) => {
          animation.current = value;
          animation.lastTimestamp = previousAnimation?.lastTimestamp ?? now;
          animation.velocity = previousAnimation?.velocity ?? config.velocity;
        },
        onFrame: (animation, now) => {
          const { lastTimestamp, current, velocity } = animation;
          const { acceleration, bounds } = config;
          const delta = (now - lastTimestamp) / 1000;
          animation.current = current + velocity * delta;
          animation.velocity =
            velocity +
            (acceleration - Math.sign(velocity) * (userConfig.kineticFriction ?? 0)) * delta;
          animation.lastTimestamp = now;
      
          if (bounds) {
            if (animation.current <= bounds[0]) {
              animation.current = bounds[0];
              if (animation.velocity <= 0) {
                animation.velocity = 0;
                return true;
              }
            } else if (animation.current >= bounds[1]) {
              animation.current = bounds[1];
              if (animation.velocity >= 0) {
                animation.velocity = 0;
                return true;
              }
            }
          }
          return false;
        },
      };
    });
  }

  const GRAVITY = 9.81 * 100;

  const { sensor } = useAnimatedSensor(SensorType.GRAVITY);

  useAnimatedReaction(
    () => {
      return isTouching.value ? undefined : GRAVITY * Math.sin(sensor.value.x);
    },
    (gravity) => {
      if (gravity !== undefined) {
        const size = measure(aRef);
        x.value = withGravity({
          bounds: [0, size.width],
          acceleration: gravity,
          staticFriction: 800,
          kineticFriction: 500,
        });
      }
    }
  );

  return (
    <Container>
      <GestureDetector gesture={gestures}>
        <View style={styles.slider} hitSlop={hitSlop} ref={aRef}>
          <Animated.View
            style={[styles.balloon, balloonStyle]}
            hitSlop={hitSlop}
          >
            <View style={styles.textContainer}>
              <AnimatedText text={progress} style={{ color: "white", fontWeight: "600" }}/>
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.progress, { width: x }]}
            hitSlop={hitSlop}
          />
          <Animated.View
            style={[styles.knob, animatedStyle]}
            hitSlop={hitSlop}
          />
        </View>
      </GestureDetector>
    </Container>
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
  slider: {
    width: "80%",
    backgroundColor: colorShades.purple.light,
    height: 5,
    justifyContent: "center",
  },
  progress: {
    height: 5,
    backgroundColor: colorShades.purple.dark,
    position: "absolute",
  },
  textContainer: {
    width: 40,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorShades.purple.base,
    position: "absolute",
    top: -layout.knobSize,
  },
  balloon: {
    alignItems: "center",
    justifyContent: "center",
    width: 4,
    height: layout.indicatorSize,
    bottom: -layout.knobSize / 2,
    borderRadius: 2,
    backgroundColor: colorShades.purple.base,
    position: "absolute",
  },
});
